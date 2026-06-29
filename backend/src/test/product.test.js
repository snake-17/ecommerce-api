const request = require("supertest");
const app = require("../app");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

// --------------------------------------------------------------
// Variables globales
// --------------------------------------------------------------
let userToken;
let adminToken;

// --------------------------------------------------------------
// beforeAll: crear usuario normal y admin (modelo Client)
// --------------------------------------------------------------
beforeAll(async () => {
  // 1. Usuario normal (rol USER por defecto)
  const userName = `name${Date.now()}`;
  const userEmail = `product-user-${Date.now()}@test.com`;
  const userPassword = "12345678";
  await request(app)
    .post("/api/auth/register")
    .send({ name: userName, email: userEmail, password: userPassword });

  const userLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: userEmail, password: userPassword });
  userToken = userLogin.body.token;

  // 2. Usuario ADMIN (creado directamente en BD)
  const adminName = `Admin${Date.now()}`;
  const adminEmail = `product-admin-${Date.now()}@test.com`;
  const adminPassword = "12345678";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await prisma.client.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: adminEmail, password: adminPassword });
  adminToken = adminLogin.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

// --------------------------------------------------------------
// Helpers para peticiones autenticadas (Ruta corregida a /create)
// --------------------------------------------------------------
const adminRequest = (body) =>
  request(app)
    .post("/api/products/create")
    .set("Authorization", `Bearer ${adminToken}`)
    .send(body);

const userRequest = (body) =>
  request(app)
    .post("/api/products/create")
    .set("Authorization", `Bearer ${userToken}`)
    .send(body);

// --------------------------------------------------------------
// Tests GET /api/products/show
// --------------------------------------------------------------
describe("GET /api/products/show", () => {
  test("Debe mostrar productos (array)", async () => {
    const response = await request(app)
      .get("/api/products/show")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("Falla si no se envía token", async () => {
    const response = await request(app).get("/api/products/show").expect(401);
    const msg = response.body.message || response.body.error;
    expect(msg).toMatch(/token|authorization/i);
  });

  test("Falla con token inválido", async () => {
    const response = await request(app)
      .get("/api/products/show")
      .set("Authorization", "Bearer token-falso")
      .expect(403);
    const msg = response.body.message || response.body.error;
    expect(msg).toMatch(/invalid|token/i);
  });

  test("Falla si el header no tiene el formato Bearer", async () => {
    await request(app)
      .get("/api/products/show")
      .set("Authorization", userToken)
      .expect(401);
  });

  test("Debe retornar 404 para ruta no existente", async () => {
    await request(app)
      .get("/api/products/inexistente")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(404);
  });

  test("La respuesta debe ser un array de objetos con las propiedades correctas", async () => {
    const response = await request(app)
      .get("/api/products/show")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      const product = response.body[0];
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("desc");
      expect(product).toHaveProperty("category");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("img");
      expect(product).not.toHaveProperty("stock");
    }
  });
});

// --------------------------------------------------------------
// Tests POST /api/products/create (Antes /update)
// --------------------------------------------------------------
describe("POST /api/products/create", () => {
  const uniqueName = () => `Producto-${Date.now()}`;

  // Payload adaptado perfectamente a tu esquema Joi
  const defaultPayload = (overrides = {}) => ({
    name: uniqueName(),
    desc: "Descripción de prueba",
    category: "clothes",
    price: 89.99,
    img: "https://imagen.com/test.jpg", // URL válida para joi.string().uri()
    stock: 25,
    ...overrides,
  });

  test("Admin puede crear un producto con datos válidos", async () => {
    const productData = defaultPayload();
    const res = await adminRequest(productData).expect(201);

    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe(productData.name);
    expect(res.body.price).toBe(productData.price);
    expect(res.body).not.toHaveProperty("stock");
  });

  test("Falla si no se envía token", async () => {
    const res = await request(app)
      .post("/api/products/create") // Corregido a /create
      .send(defaultPayload())
      .expect(401);
    const msg = res.body.message || res.body.error;
    expect(msg).toMatch(/token|authorization/i);
  });

  test("Falla con token inválido", async () => {
    const res = await request(app)
      .post("/api/products/create") // Corregido a /create
      .set("Authorization", "Bearer token-falso")
      .send(defaultPayload())
      .expect(403);
    const msg = res.body.message || res.body.error;
    expect(msg).toMatch(/invalid|token/i);
  });

  test("Falla con token de usuario normal (rol USER)", async () => {
    const res = await userRequest(defaultPayload()).expect(403);
    expect(res.body.message).toMatch(/admin|access required/i);
  });

  // -------------------- VALIDACIONES Joi --------------------
  test("Falla si falta name", async () => {
    const { name, ...body } = defaultPayload();
    const res = await adminRequest(body).expect(400);
    expect(res.body.message).toMatch(/name/i);
  });

  test("Falla si falta price", async () => {
    const { price, ...body } = defaultPayload();
    const res = await adminRequest(body).expect(400);
    expect(res.body.message).toMatch(/price/i);
  });

  test("Falla si falta stock", async () => {
    const { stock, ...body } = defaultPayload();
    const res = await adminRequest(body).expect(400);
    expect(res.body.message).toMatch(/stock/i);
  });

  test("Falla si name tiene menos de 3 caracteres", async () => {
    const res = await adminRequest(defaultPayload({ name: "ab" })).expect(400);
    expect(res.body.message).toMatch(/name/i);
  });

  test("Falla si name tiene más de 100 caracteres", async () => {
    const longName = "a".repeat(101);
    const res = await adminRequest(defaultPayload({ name: longName })).expect(
      400,
    );
    expect(res.body.message).toMatch(/name/i);
  });

  test("Falla si price es negativo", async () => {
    const res = await adminRequest(defaultPayload({ price: -10 })).expect(400);
    expect(res.body.message).toMatch(/price/i);
  });

  test("Falla si price tiene más de 2 decimales", async () => {
    const res = await adminRequest(defaultPayload({ price: 10.123 })).expect(
      400,
    );
    expect(res.body.message).toMatch(/price/i);
  });

  test("Falla si stock no es entero", async () => {
    const res = await adminRequest(defaultPayload({ stock: 5.7 })).expect(400);
    expect(res.body.message).toMatch(/stock/i);
  });

  test("Falla si stock es negativo", async () => {
    const res = await adminRequest(defaultPayload({ stock: -5 })).expect(400);
    expect(res.body.message).toMatch(/stock/i);
  });

  test("Falla si se envía un campo adicional", async () => {
    const res = await adminRequest({
      ...defaultPayload(),
      extraField: "valor",
    }).expect(400);
    expect(res.body.message).toMatch(/extra|unknown|not allowed/i);
  });

  // -------------------- CONFLICTO DE NOMBRE DUPLICADO --------------------
  test("Falla si ya existe un producto con el mismo nombre", async () => {
    const sharedName = uniqueName();
    const productData = defaultPayload({ name: sharedName });

    await adminRequest(productData).expect(201);
    const res = await adminRequest(productData).expect(409);
    expect(res.body.message).toBe("product already exists");
  });
});

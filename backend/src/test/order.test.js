const request = require("supertest");
const app = require("../app");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

let userToken;
let adminToken;
let testProduct1, testProduct2;

beforeAll(async () => {
  // Limpieza inicial respetando el orden de integridad referencial
  await prisma.orderItem.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});

  const timestamp = Date.now();

  // 1.1 Crear y autenticar Usuario Normal
  const userName = `name${Date.now()}`;
  const userEmail = `order-user-${timestamp}@test.com`;
  const userPassword = "12345678";

  await request(app)
    .post("/api/auth/register")
    .send({ name: userName, email: userEmail, password: userPassword });

  const userLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: userEmail, password: userPassword });

  userToken = userLogin.body.token;

  // 1.2 Crear y autenticar Usuario Admin
  const adminName = `admin${Date.now()}`;
  const adminEmail = `order-admin-${timestamp}@test.com`;
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

  // 1.3 Crear productos de prueba con estructura Joi válida
  const product1 = await request(app)
    .post("/api/products/create")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: `Producto Test 1 ${timestamp}`,
      desc: "Descripción test 1",
      category: "clothes",
      price: 19.99,
      img: "https://imagen.com/test1.jpg",
      stock: 10,
    });

  const product2 = await request(app)
    .post("/api/products/create")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: `Producto Test 2 ${timestamp}`,
      desc: "Descripción test 2",
      category: "clothes",
      price: 29.99,
      img: "https://imagen.com/test2.jpg",
      stock: 5,
    });

  testProduct1 = product1.body.id || product1.body.productId;
  testProduct2 = product2.body.id || product2.body.productId;

  if (!testProduct1 || !testProduct2) {
    console.error(
      "Error al setear productos de prueba:",
      product1.body,
      product2.body,
    );
    throw new Error("No se pudo obtener el ID de los productos de prueba");
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

// --------------------------------------------------------------
// TESTS
// --------------------------------------------------------------

describe("POST /api/orders", () => {
  test("Debe crear una orden para el usuario autenticado", async () => {
    const response = await request(app)
      .post("/api/orders") // Ajustado a ruta estándar REST raíz
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("orden");
    expect(response.body.orden).toBeDefined();
  });

  test("Falla si no se envía un token de autenticación", async () => {
    await request(app).post("/api/orders").expect(401);
  });
});

describe("POST /api/orders/:id/items", () => {
  let orderId;

  beforeEach(async () => {
    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`);
    orderId = createRes.body.orden;
  });

  test("Debe agregar items a la orden correctamente (Estado RESERVED)", async () => {
    const validItemsPayload = [
      { productId: Number(testProduct1), quantity: 2 },
      { productId: Number(testProduct2), quantity: 1 },
    ];

    const response = await request(app)
      .post(`/api/orders/${orderId}/items`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: validItemsPayload })
      .expect(200);

    expect(response.body).toHaveProperty("count");
    expect(response.body.count).toBe(2);
  });

  test("Falla si el orderId enviado no es numérico", async () => {
    await request(app)
      .post("/api/orders/abc/items")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [{ productId: Number(testProduct1), quantity: 1 }] })
      .expect(400);
  });

  test("Falla si la orden no existe en la base de datos", async () => {
    await request(app)
      .post("/api/orders/999999/items")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [{ productId: Number(testProduct1), quantity: 1 }] })
      .expect(404);
  });

  test("Falla si el array de items viene vacío", async () => {
    await request(app)
      .post(`/api/orders/${orderId}/items`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [] })
      .expect(400);
  });

  test("Falla si la cantidad (quantity) es negativa o cero", async () => {
    await request(app)
      .post(`/api/orders/${orderId}/items`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [{ productId: Number(testProduct1), quantity: -5 }] })
      .expect(400);
  });

  test("Falla si la orden pertenece a otro cliente", async () => {
    const otherEmail = `other-client-${Date.now()}@test.com`;
    const otherName = `Other Client ${Date.now()}`;

    await request(app)
      .post("/api/auth/register")
      .send({ name: otherName, email: otherEmail, password: "12345678" });

    const otherLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: otherEmail, password: "12345678" });
    const otherToken = otherLogin.body.token;

    const otherOrder = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${otherToken}`);
    const otherOrderId = otherOrder.body.orden;

    await request(app)
      .post(`/api/orders/${otherOrderId}/items`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [{ productId: Number(testProduct1), quantity: 1 }] })
      .expect(403);
  });
});

describe("POST /api/orders/:id/pay", () => {
  let orderId;

  beforeEach(async () => {
    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`);
    orderId = createRes.body.orden;

    await request(app)
      .post(`/api/orders/${orderId}/items`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [{ productId: Number(testProduct1), quantity: 1 }] });
  });

  test("Debe pagar una orden exitosamente (Status 204)", async () => {
    await request(app)
      .post(`/api/orders/${orderId}/pay`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(204);
  });

  test("Falla al intentar pagar una orden que ya fue pagada", async () => {
    await request(app)
      .post(`/api/orders/${orderId}/pay`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(204);

    await request(app)
      .post(`/api/orders/${orderId}/pay`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(400);
  });
});

describe("POST /api/orders/:id/cancel", () => {
  let orderId;

  beforeEach(async () => {
    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`);
    orderId = createRes.body.orden;

    await request(app)
      .post(`/api/orders/${orderId}/items`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [{ productId: Number(testProduct1), quantity: 1 }] });
  });

  test("Debe cancelar una orden RESERVED exitosamente (Status 204)", async () => {
    await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(204);
  });

  test("Falla si se intenta cancelar una orden que ya fue pagada", async () => {
    await request(app)
      .post(`/api/orders/${orderId}/pay`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(204);

    await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(400);
  });
});

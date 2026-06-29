const request = require("supertest");
const app = require("../app");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

// IMPORTANTE: Importa el eventBus original de tu proyecto para poder espiarlo
const eventBus = require("../eventDriven/eventBus");

// --------------------------------------------------------------
// Variables globales para el contexto de las pruebas
// --------------------------------------------------------------
let userToken;
let adminToken;
let testProduct1;
let emitSpy;

// --------------------------------------------------------------
// 1. Preparación global antes de los tests
// --------------------------------------------------------------
beforeAll(async () => {
  // Limpieza inicial respetando el orden de integridad referencial
  await prisma.orderItem.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});

  const timestamp = Date.now();

  // 1.1 Configurar el Espía (Spy) en el eventBus
  emitSpy = jest.spyOn(eventBus, "emit");

  // 1.2 Crear y autenticar Usuario Normal (Se añade 'name')
  const userName = `name${Date.now()}`;
  const userEmail = `event-user-${timestamp}@test.com`;
  const userPassword = "12345678";
  await request(app)
    .post("/api/auth/register")
    .send({ name: userName, email: userEmail, password: userPassword });

  const userLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: userEmail, password: userPassword });
  userToken = userLogin.body.token;

  // 1.3 Crear y autenticar Usuario Admin (Se añade 'name')
  const adminName = `admin${Date.now()}`;
  const adminEmail = `event-admin-${timestamp}@test.com`;
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

  // 1.4 Crear un producto de prueba (Ruta cambiada a /create y campos nuevos requeridos añadidos)
  const product = await request(app)
    .post("/api/products/create")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: `Producto Evento ${timestamp}`,
      desc: "Descripción evento test",
      category: "clothes", // Enum válido de tu Prisma
      price: 10.0,
      img: "https://imagen.com/event-test.jpg",
      stock: 20,
    });

  testProduct1 = product.body.id || product.body.productId;
});

// --------------------------------------------------------------
// 2. Controladores de ciclo de vida entre ejecuciones
// --------------------------------------------------------------
beforeEach(() => {
  emitSpy.mockClear();
});

afterAll(async () => {
  emitSpy.mockRestore();
  await prisma.$disconnect();
});

// --------------------------------------------------------------
// 3. Casos de Prueba (Assertions)
// --------------------------------------------------------------
describe("Pruebas de Arquitectura Dirigida por Eventos (EventBus)", () => {
  let orderId;

  test("Debe emitir 'order.created' cuando el cliente genera una orden vacía", async () => {
    const response = await request(app)
      .post("/api/orders/") // Ruta cambiada de /orders/create a /orders (Raíz)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    orderId = response.body.orden;

    expect(emitSpy).toHaveBeenCalledWith(
      "order.created",
      expect.objectContaining({ id: orderId, status: "CREATED" }),
    );
  });

  test("Debe emitir 'order.reserved' al añadir items válidos", async () => {
    const payload = [{ productId: Number(testProduct1), quantity: 2 }];

    await request(app)
      .post(`/api/orders/${orderId}/items`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: payload }) // Payload envuelto correctamente
      .expect(200);

    expect(emitSpy).toHaveBeenCalledWith("order.reserved", expect.any(Array));
  });

  test("Debe emitir 'inventory.released' y 'order.paid' al procesar el pago", async () => {
    await request(app)
      .post(`/api/orders/${orderId}/pay`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(204);

    expect(emitSpy).toHaveBeenCalledWith(
      "inventory.released",
      expect.any(Object),
    );

    expect(emitSpy).toHaveBeenCalledWith(
      "order.paid",
      expect.objectContaining({ id: orderId }),
    );
  });

  test("Debe emitir 'inventory.released' y 'order.cancelled' al cancelar una orden RESERVED", async () => {
    // Generamos una nueva orden y le añadimos items (Ruta raíz /api/orders)
    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`);
    const newOrderId = createRes.body.orden;

    await request(app)
      .post(`/api/orders/${newOrderId}/items`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [{ productId: Number(testProduct1), quantity: 1 }] });

    // Limpiamos los eventos acumulados por la creación y los items
    emitSpy.mockClear();

    await request(app)
      .post(`/api/orders/${newOrderId}/cancel`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(204);

    expect(emitSpy).toHaveBeenCalledWith(
      "inventory.released",
      expect.any(Object),
    );

    expect(emitSpy).toHaveBeenCalledWith(
      "order.cancelled",
      expect.objectContaining({ id: newOrderId }),
    );
  });
});

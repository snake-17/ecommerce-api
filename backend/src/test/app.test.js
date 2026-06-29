const request = require("supertest");
const app = require("../app");

describe("GET /", () => {
  test("Debe responder un hello", async () => {
    const response = await request(app).get("/").expect(200);
    expect(response.text).toBe("Hello world");
  });
});

describe("POST /api/auth/register", () => {
  const getUniqueEmail = () => `test${Date.now()}@test.com`;
  const getName = () => `test${Date.now()}`;
  const validPassword = "12345678";
  test("Debe crear usuario correctamente", async () => {
    const email = getUniqueEmail();
    const name = getName();
    const response = await request(app)
      .post("/api/auth/register")
      .send({ name, email, password: validPassword });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User registered successfully");
  });

  test("Debe fallar si falta el password y name", async () => {
    const email = getUniqueEmail();
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/(password|name)/i);
  });

  test("Debe fallar si el email ya existe", async () => {
    const email = getUniqueEmail();
    const name = getName();
    // Primer registro exitoso (con contraseña válida)
    await request(app)
      .post("/api/auth/register")
      .send({ name, email, password: validPassword });

    // Segundo registro con el mismo email
    const response = await request(app)
      .post("/api/auth/register")
      .send({ name, email, password: validPassword });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("EMAIL ALREADY EXISTS");
  });

  test("Debe fallar si el email no tiene formato válido", async () => {
    const name = getName();
    const response = await request(app)
      .post("/api/auth/register")
      .send({ name, email: "correo-invalido", password: validPassword });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/email/i);
  });
});

describe("POST /api/auth/login", () => {
  const loginEmail = `login${Date.now()}@test.com`;
  const loginPassword = "12345678";
  const loginName = `login${Date.now()}`;

  beforeAll(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: loginName, email: loginEmail, password: loginPassword });
  });

  test("Debe iniciar sesión correctamente y devolver token", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: loginEmail, password: loginPassword });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
    // Opcional: verificar que es un JWT válido
    const tokenParts = response.body.token.split(".");
    expect(tokenParts).toHaveLength(3);
  });

  test("Debe fallar con email incorrecto", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "wrong@test.com", password: loginPassword });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("INVALID EMAIL OR PASSWORD");
  });

  test("Debe fallar con password incorrecto", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: loginEmail, password: "wrongpass" });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("INVALID EMAIL OR PASSWORD");
  });

  test("Debe fallar si falta el password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: loginEmail });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/password/i);
  });

  test("Debe fallar si el email no es válido", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "correo-invalido", password: loginPassword });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/email/i);
  });
});
describe("POST /api/auth/edit", () => {
  const loginEmail = `login${Date.now()}@test.com`;
  const loginPassword = "12345678";
  const loginName = `login${Date.now()}`;
  beforeAll(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: loginName, email: loginEmail, password: loginPassword });
    await request(app)
      .post("/api/auth/login")
      .send({ email: loginEmail, password: loginPassword });
  });
  test("Debe permitir cambiar el nombre de usuario", async () => {
    const response = await request(app)
      .patch("/api/auth/edit")
      .send({ name: loginName, email: loginEmail, password: loginPassword });
    expect(response.statusCode).toBe(200);
  });
});

const { Router } = require("express");
const { register, login, edit } = require("../controllers/authController");
const validatorHandler = require("../middleware/validatorHandler");
const schema = require("../schema/joi.schema"); //debo cambiar el nombre
const rateLimit = require("../middleware/rateLimit");

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: Permite la creación de cuentas de clientes en la plataforma de manera pública.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Juan José"
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 254
 *                 example: "usuario@ejemplo.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 72
 *                 example: "password123"
 *       responses:
 *         201:
 *           description: Usuario registrado exitosamente.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "User registered successfully"
 *         400:
 *           description: Error de validación (Joi) o el email ya está en uso.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorRespuesta'
 */
router.post(
  "/register",
  validatorHandler(schema.validateDataRegister, "body"),
  rateLimit.registerRateLimit,
  register,
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     description: Autentica al usuario mediante email y contraseña, retornando un token JWT válido por 4 horas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@ejemplo.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Autenticación exitosa. Retorna el token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Credenciales incorrectas o inválidas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRespuesta'
 */
router.post(
  "/login",
  validatorHandler(schema.validateDataLogin, "body"),
  rateLimit.loginRateLimit,
  login,
);
/**
 * @openapi
 * /auth/edit:
 *   patch:
 *     summary: Editar el nombre del cliente
 *     description: Actualiza el nombre de un cliente tras validar su correo electrónico y contraseña actual. Cuenta con protección mediante Rate Limit.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre del cliente.
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del cliente.
 *                 example: "cliente@correo.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña actual del cliente.
 *                 example: "Segura123!"
 *             required:
 *               - name
 *               - email
 *               - password
 *             additionalProperties: false
 *     responses:
 *       '200':
 *         description: Nombre actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Name updated successfully"
 *
 *       '400':
 *         description: Datos inválidos o credenciales incorrectas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "INVALID EMAIL OR PASSWORD"
 *
 *       '429':
 *         description: Demasiadas peticiones desde esta IP.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Too many requests, please try again later."
 */
router.patch(
  "/edit",
  validatorHandler(schema.validateDataEdit, "body"),
  rateLimit.loginRateLimit,
  edit,
);

module.exports = router;

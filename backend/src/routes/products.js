const { Router } = require("express");
const authController = require("../middleware/auth");
const validatorHandler = require("../middleware/validatorHandler");
const schema = require("../schema/joi.schema");
const {
  showProducts,
  addProduct,
} = require("../controllers/productController");

const router = Router();

/**
 * @openapi
 * /products/show:
 *   get:
 *     summary: Obtiene la lista de productos
 *     description: Retorna un arreglo con todos los productos registrados mostrando sus detalles extendidos. Requiere autenticación.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 *       401:
 *         description: No autorizado. Token faltante o con formato incorrecto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRespuesta'
 *       403:
 *         description: Prohibido. Token inválido o expirado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRespuesta'
 */
router.get("/show", authController, showProducts);

/**
 * @openapi
 * /products/create:
 *   post:
 *     summary: Crea un nuevo producto con su inventario inicial
 *     description: Permite registrar un producto nuevo en el sistema y le asigna su cantidad inicial en inventario de forma segura mediante transacciones. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Teclado Mecánico RGB
 *               desc:
 *                 type: string
 *                 maxLength: 500
 *                 example: Teclado con switches mecánicos ideales para programar.
 *               category:
 *                 type: string
 *                 enum: [clothes, electronics, furnitures, toys, others]
 *                 default: others
 *                 example: electronics
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 79.99
 *                 description: Precio positivo con máximo 2 decimales.
 *               img:
 *                 type: string
 *                 format: uri
 *                 example: https://imagenes.com/productos/teclado.jpg
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 25
 *     responses:
 *       201:
 *         description: Producto creado con éxito junto con su inventario inicial. Retorna los datos del producto insertado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos de entrada inválidos (Error de validación Joi).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRespuesta'
 *       401:
 *         description: No autorizado. Token faltante.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRespuesta'
 *       403:
 *         description: Acceso prohibido. Se requiere rol ADMIN o token inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRespuesta'
 *       409:
 *         description: Conflicto. Ya existe un producto con ese mismo nombre.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRespuesta'
 */
router.post(
  "/create",
  authController,
  validatorHandler(schema.validateProduct, "body"),
  addProduct,
);

module.exports = router;

/**
 * @openapi
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Teclado Mecánico RGB
 *         desc:
 *           type: string
 *           example: Teclado con switches mecánicos ideales para programar.
 *         category:
 *           type: string
 *           enum: [clothes, electronics, furnitures, toys, others]
 *           example: electronics
 *         price:
 *           type: number
 *           example: 79.99
 *         img:
 *           type: string
 *           format: uri
 *           example: https://imagenes.com/productos/teclado.jpg
 *         active:
 *           type: boolean
 *           example: true
 *     ErrorRespuesta:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 400
 *         error:
 *           type: string
 *           example: Bad Request
 *         message:
 *           type: string
 *           example: '"name" is required'
 */

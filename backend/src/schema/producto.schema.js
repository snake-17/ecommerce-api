/**
 * @openapi
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del producto
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre del producto
 *           example: "Teclado Mecánico"
 *         price:
 *           type: number
 *           format: float
 *           description: Precio del producto local
 *           example: 79.99
 *         stock:
 *           type: integer
 *           description: Cantidad disponible en stock
 *           example: 15
 */

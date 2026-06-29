const { Router } = require("express");
const authController = require("../middleware/auth");
const validatorHandler = require("../middleware/validatorHandler");
const schema = require("../schema/joi.schema");
const orderController = require("../controllers/orderController");

const router = Router();

/**
 * @openapi
 * /orders/:
 *   post:
 *     summary: Inicializa una nueva orden de compra
 *     description: Crea un registro de orden en estado "CREATED" vinculado al cliente autenticado. Dispara el evento "order.created".
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orden inicializada con éxito. Devuelve el ID generado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orden:
 *                   type: integer
 *                   example: 45
 *       401:
 *         description: No autorizado. Token faltante o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRespuesta'
 */
router.post("/", authController, orderController.order);
/**
 * @openapi
 * /orders/{id}/items:
 *   post:
 *     summary: Agrega productos a una orden existente
 *     description: Reserva stock en el inventario, calcula el total financiero y asigna una fecha de expiración a la orden (estado "RESERVED").
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden de compra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 3
 *     responses:
 *       200:
 *         description: Items agregados y stock reservado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Confirmación de filas creadas en orderItem.
 *       400:
 *         description: Error de validación o datos de items incorrectos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRespuesta'
 */
router.post(
  "/:id/items",
  authController,
  validatorHandler(schema.validateOrderId, "params"),
  validatorHandler(schema.validateItems, "body"),
  orderController.addItems,
);
/**
 * @openapi
 * /orders/{id}/pay:
 *   post:
 *     summary: Pagar una orden de compra
 *     description: Transacciona la orden a estado "PAID" y descuenta de manera definitiva las cantidades retenidas del inventario.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden a pagar
 *     responses:
 *       204:
 *         description: Pago procesado correctamente. No retorna contenido.
 *       400:
 *         description: La orden no cumple los requisitos para pagarse o ya expiró.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRespuesta'
 */
router.post(
  "/:id/pay",
  authController,
  validatorHandler(schema.validateOrderId, "params"),
  orderController.payment,
);
/**
 * @openapi
 * /orders/{id}/cancel:
 *   post:
 *     summary: Cancelar una orden de compra
 *     description: Libera el stock retenido devolviéndolo al inventario disponible y cambia el estado de la orden a "CANCELLED".
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden a cancelar
 *     responses:
 *       204:
 *         description: Orden cancelada y stock restaurado con éxito.
 *       400:
 *         description: Error al intentar cancelar la orden.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRespuesta'
 */
router.post(
  "/:id/cancel",
  authController,
  validatorHandler(schema.validateOrderId, "params"),
  orderController.cancel,
);

module.exports = router;

const {
  lookingForOrderItems,
  updateQuantity,
} = require("../helpers/paymentHelpers");
const cron = require("node-cron");
const eventBus = require("../eventDriven/eventBus");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
function checkStatus() {
  console.log(`[${new Date().toISOString()}] Programando revisar status`);
  const cronJob = cron.schedule("*/30 * * * *", async () => {
    try {
      const now = new Date();
      const orders = await prisma.order.findMany({
        where: {
          status: "RESERVED",
          expiresAt: {
            lt: now,
          },
        },
      });
      for (const order of orders) {
        await prisma.$transaction(async (tx) => {
          const orderItems = await lookingForOrderItems(tx, order);
          await updateQuantity(tx, orderItems, "EXPIRED", order.id);
        });
      }
      eventBus.emit("order.expired", orders);
      if (orders.length > 0) {
        console.log(
          `[${new Date().toISOString()}] ✅ ${orders.length} pedido(s) marcado(s) como EXPIRED`,
        );
      } else {
        console.log(
          `[${new Date().toISOString()}] ℹ️ No hay pedidos expirados para actualizar`,
        );
      }
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] ❌ Error en cron job checkStatus:`,
        error,
      );
    }
  });
  return cronJob;
}
module.exports = { checkStatus };

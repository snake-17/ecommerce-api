const eventBus = require("./eventBus");

eventBus.on("order.created", async (orderData) => {
  try {
    console.log(`[Worker] nueva orden con id: ${orderData.id} creada`);
  } catch (error) {
    console.error(`Fallo en listener order.created:`, error);
  }
});
eventBus.on("order.reserved", async (orderData) => {
  try {
    console.log(
      `[Worker] nueva orden con id: ${orderData.orderId}, products Id: ${orderData.productId}, cantidad: ${orderData.quantity} reservada`,
    );
  } catch (error) {
    console.error(`Fallo en listener order.reserved:`, error);
  }
});
eventBus.on("order.paid", async (orderData) => {
  try {
    console.log(`[Worker] nueva orden ${orderData} pagada`);
  } catch (error) {
    console.error(`Fallo en listener order.paid:`, error);
  }
});
eventBus.on("order.cancelled", async (orderData) => {
  try {
    console.log(`[Worker] nueva orden cancelada`);
  } catch (error) {
    console.error(`Fallo en listener order.cancelled:`, error);
  }
});
eventBus.on("order.expired", async (orderData) => {
  try {
    console.log(
      `[${new Date().toISOString()}] order id:${orderData.id} de cliente:${orderData.clientId} EXPIRED`,
    );
  } catch (error) {
    console.error(`Fallo en listener order.expired:`, error);
  }
});
eventBus.on("inventory.released", async (orderData) => {
  try {
    console.log(
      `[${new Date().toISOString()}] inventario repuesto:${orderData.totalQuantity}`,
    );
  } catch (error) {}
});

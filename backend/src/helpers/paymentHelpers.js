const boom = require("@hapi/boom");
const eventBus = require("../eventDriven/eventBus");
const validateOrder = async (tx, orderId, clientId) => {
  const order = await tx.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      clientId: true,
      status: true,
    },
  });

  if (!order) throw boom.badRequest("order not found");
  if (order.clientId !== clientId) throw boom.badRequest("Unauthorized");
  if (order.status !== "RESERVED")
    throw boom.badRequest("Order cannot be paid or canceled");
  return order;
};
const lookingForOrderItems = async (tx, order) => {
  const bill = await tx.orderItem.findMany({
    where: {
      orderId: order.id,
    },
    select: {
      productId: true,
      quantity: true,
    },
  });
  return bill;
};
const updateQuantity = async (tx, bill, status, orderId) => {
  for (const i of bill) {
    const inventory = await tx.inventory.findUnique({
      where: {
        productId: i.productId,
      },
      select: {
        totalQuantity: true,
        reservedQuantity: true,
      },
    });
    const released = await tx.inventory.update({
      where: {
        productId: i.productId,
      },
      data: {
        totalQuantity:
          status === "PAID"
            ? inventory.totalQuantity - i.quantity
            : inventory.totalQuantity,
        reservedQuantity: inventory.reservedQuantity - i.quantity,
      },
    });
    eventBus.emit("inventory.released", released);
  }
  await tx.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: status,
    },
  });
};
module.exports = {
  validateOrder,
  lookingForOrderItems,
  updateQuantity,
};

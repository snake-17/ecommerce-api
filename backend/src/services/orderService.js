const boom = require("@hapi/boom");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  validateClientId,
  validateItems,
  getProductsWithPrices,
  reserveStock,
  calculateTotal,
  buildOrderItems,
  validateOrderForAdd,
} = require("../helpers/addItemsHelpers");
const {
  validateOrder,
  lookingForOrderItems,
  updateQuantity,
} = require("../helpers/paymentHelpers");
const eventBus = require("../eventDriven/eventBus");
exports.createOrder = async (clientId) => {
  validateClientId(clientId);
  const order = await prisma.order.create({
    data: {
      clientId,
      status: "CREATED",
      totalAmount: 0,
      expiresAt: null,
    },
  });
  eventBus.emit("order.created", order);
  return order.id;
};

exports.addItems = async (clientId, orderId, body) => {
  const { items } = body;
  validateClientId(clientId);
  validateItems(items);
  return prisma.$transaction(async (tx) => {
    await reserveStock(tx, items);
    const products = await getProductsWithPrices(tx, items);
    const totalAmount = calculateTotal(items, products);
    const numeros = Date.now() + 60000; //900000
    const expiresAt = new Date(numeros);
    await validateOrderForAdd(tx, orderId, clientId);
    await tx.order.update({
      where: {
        id: orderId,
      },
      data: { status: "RESERVED", totalAmount, expiresAt },
    });
    const orderItemsData = buildOrderItems(orderId, items, products);
    eventBus.emit("order.reserved", orderItemsData);
    return await tx.orderItem.createMany({
      data: orderItemsData,
    });
  });
};
exports.payment = async (orderId, clientId) => {
  await prisma.$transaction(async (tx) => {
    const order = await validateOrder(tx, orderId, clientId);
    //aqui iria la validacion de pago, que me saltare.
    const orderitems = await lookingForOrderItems(tx, order);
    //busca renglo a renglon
    //en la factura o ticket de compra los productos que seran repuestos
    await updateQuantity(tx, orderitems, "PAID", orderId);
    eventBus.emit("order.paid", order);
  });
};

exports.cancel = async (orderId, clientId) => {
  await prisma.$transaction(async (tx) => {
    const order = await validateOrder(tx, orderId, clientId);
    const orderitems = await lookingForOrderItems(tx, order);
    await updateQuantity(tx, orderitems, "CANCELLED", orderId);
    eventBus.emit("order.cancelled", order);
  });
};

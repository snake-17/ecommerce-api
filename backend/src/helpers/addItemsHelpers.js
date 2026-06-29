const boom = require("@hapi/boom");

const validateClientId = (clientId) => {
  if (!Number.isInteger(clientId)) {
    throw boom.badRequest("Invalid id");
  }
};
const validateItems = (items) => {
  const idsVisto = new Set();
  for (const u of items) {
    if (idsVisto.has(u.productId)) {
      throw boom.conflict("PRODUCT ID REPEATED");
    } else {
      idsVisto.add(u.productId);
    }
  }
};
const getProductsWithPrices = async (tx, items) => {
  const productIds = items.map((i) => i.productId); //cuantos productos pides? lo almacena.
  const products = await tx.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
      price: true,
    },
  });
  if (products.length !== productIds.length) {
    //compara cuantos encontro contra cuantos pediste.
    const foundIds = new Set(products.map((p) => p.id));
    const missing = productIds.filter((id) => !foundIds.has(id));
    throw boom.notFound(`Products not found: ${missing.join(", ")}`);
  }
  return products;
};
const reserveStock = async (tx, items) => {
  for (const aux of items) {
    const disponibilidad = await tx.inventory.findUnique({
      where: {
        productId: aux.productId,
      },
      select: {
        totalQuantity: true,
        reservedQuantity: true,
      },
    });
    if (!disponibilidad) {
      throw boom.notFound(`Inventory not found for ${aux.productId}`);
    }
    const disponible =
      disponibilidad.totalQuantity - disponibilidad.reservedQuantity;
    if (disponible < aux.quantity) {
      throw boom.conflict(`Product out of stock: ${aux.productId}`);
    }
    const final = disponibilidad.reservedQuantity + aux.quantity;
    await tx.inventory.update({
      where: {
        productId: aux.productId,
      },
      data: {
        reservedQuantity: final,
      },
    });
  }
};
const calculateTotal = (items, products) => {
  return items.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId);
    return total + Number(product.price) * item.quantity;
  }, 0);
};
const buildOrderItems = (orderId, items, products) => {
  return items.map((item) => ({
    orderId,
    productId: item.productId,
    quantity: item.quantity,
    priceAtPurchase: products.find((p) => p.id === item.productId).price,
  }));
};
const validateOrderForAdd = async (tx, orderId, clientId) => {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: { clientId: true, status: true },
  });
  if (!order) throw boom.notFound("Order doesn't exist");
  if (order.clientId !== clientId)
    throw boom.forbidden("Order does not belong to this client");
  if (order.status !== "CREATED")
    throw boom.conflict("Cannot add items to this order");
  return order;
};
module.exports = {
  validateClientId,
  validateItems,
  getProductsWithPrices,
  reserveStock,
  calculateTotal,
  buildOrderItems,
  validateOrderForAdd,
};

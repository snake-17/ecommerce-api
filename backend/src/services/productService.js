const { PrismaClient } = require("@prisma/client");
const boom = require("@hapi/boom");
const prisma = new PrismaClient();

const getProducts = async () => {
  const product = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      desc: true,
      category: true,
      price: true,
      img: true,
    },
  });
  return product;
};
const createProduct = async (name, desc, category, price, img, stock, role) => {
  if (role !== "ADMIN") {
    throw boom.forbidden("ADMIN ACCES REQUIRED");
  }
  return await prisma.$transaction(async (tx) => {
    const buscar = await tx.product.findFirst({
      where: {
        name: name,
      },
    });
    if (!buscar) {
      const newProduct = await tx.product.create({
        data: { name, desc, category, price, img },
      });
      await tx.inventory.create({
        data: {
          productId: newProduct.id,
          totalQuantity: stock,
          reservedQuantity: 0,
        },
      });
      return {
        ...newProduct,
        price: Number(newProduct.price),
      };
    }
    throw boom.conflict("product already exists");
  });
};
module.exports = { getProducts, createProduct };

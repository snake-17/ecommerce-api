const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const inventory = [
  { productId: 1, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 2, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 3, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 4, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 5, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 6, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 7, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 8, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 9, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 10, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 11, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 12, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 13, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 14, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 15, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 16, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 17, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 18, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 19, totalQuantity: 20, reservedQuantity: 0 },
  { productId: 20, totalQuantity: 20, reservedQuantity: 0 },
];
async function main() {
  for (const i of inventory) {
    await prisma.inventory.create({
      data: {
        productId: i.productId,
        totalQuantity: i.totalQuantity,
        reservedQuantity: i.reservedQuantity,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

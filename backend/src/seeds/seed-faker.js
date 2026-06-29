const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const categories = ["clothes", "electronics", "furnitures", "toys", "others"];

  const { faker } = await import("@faker-js/faker");
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < 100; i++) {
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];
      const product = await tx.product.create({
        data: {
          name: faker.commerce.productName(),
          desc: faker.commerce.productDescription().slice(0, 150),
          category: randomCategory,
          price: parseFloat(faker.commerce.price(), 10),
          img: faker.image.url(),
          active: true,
        },
      });
      await tx.inventory.create({
        data: {
          productId: product.id,
          totalQuantity: faker.number.int({ min: 1, max: 100 }),
          reservedQuantity: 0,
        },
      });
    }
    //aqui
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

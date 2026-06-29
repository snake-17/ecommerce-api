const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const productos = [
  ["chafubu", 50.0, true],
  ["chafarin", 70.0, true],
  ["ternurin", 700.0, true],
  ["labubu", 50.0, true],
  ["bubululu", 85.5, true],
  ["mini-ternu", 120.0, true],
  ["megabubu", 1200.0, true],
  ["chafita-pro", 45.0, true],
  ["osobu-azul", 310.0, true],
  ["ternurin-gold", 1500.0, true],
  ["gatubu-noche", 250.0, true],
  ["chafarin-mini", 30.0, true],
  ["super-ternu", 450.0, true],
  ["bubulin-pink", 95.0, true],
  ["monster-bu", 600.0, true],
  ["chafubu-v2", 55.0, true],
  ["ternu-llavero", 80.0, true],
  ["bubu-galaxy", 900.0, true],
  ["chafarin-plus", 110.0, true],
  ["ternurin-bebe", 190.0, true],
];

async function main() {
  for (const p of productos) {
    await prisma.product.create({
      data: {
        name: p[0],
        price: p[1],
        active: p[2],
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

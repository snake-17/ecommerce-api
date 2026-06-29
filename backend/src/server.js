const app = require("./app");
const PORT = process.env.PORT || 3000;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { checkStatus } = require("./jobs/expireOrdersJob");
require("./eventDriven/eventBus");
require("./eventDriven/listeners");

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Base de datos conectada");

    checkStatus();
    console.log("Cron job programado");

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}
startServer();
process.on("uncaughtException", (err) => {
  console.error("¡Ups! Se nos escapó un error:", err);
});

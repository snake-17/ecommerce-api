const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOption = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Api carrito de compras",
      version: "1.0.0",
      description:
        "API Carrito de compras, con cron job, status de compra; expirar compra, cancelar compra.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    servers: [
      {
        url: "http://localhost:3006/api",
        description: "Servidor Local",
      },
    ],
  },
  apis: ["./server.js", "./src/routes/*.js", "./src/schema/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOption);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

module.exports = setupSwagger;

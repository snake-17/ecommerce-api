const express = require("express");
const setupSwagger = require("./config/swagger");
const cors = require("cors");
const {
  logErrors,
  boomErrorHandler,
  errorHandler,
} = require("./middleware/errorHandler");
const routes = require("./routes");
const app = express();

app.use(cors());
app.use(express.json());
setupSwagger(app);
app.get("/", (req, res) => {
  res.send("Hello world");
});
app.use("/api", routes);
app.use(logErrors);
app.use(boomErrorHandler);
app.use(errorHandler);

module.exports = app;

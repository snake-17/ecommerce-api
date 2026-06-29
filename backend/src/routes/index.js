const { Router } = require("express");
const authRouter = require("./auth");
const products = require("./products");
const orders = require("./orders");
const router = Router();
const rateLimit = require("../middleware/rateLimit");

router.use("/auth", authRouter);
router.use("/products", products, rateLimit.productsRateLimit);
router.use("/orders", orders, rateLimit.orderRateLimit);
module.exports = router;

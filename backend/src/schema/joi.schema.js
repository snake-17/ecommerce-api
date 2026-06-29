const joi = require("joi");

const email = joi.string().email().max(254).lowercase().trim();
const password = joi.string().min(8).max(72);
const name = joi.string().trim().min(3).max(100);
const desc = joi.string().trim().max(500);
const category = joi.string().trim().max(500);
const img = joi.string().uri().trim(); // Valida que sea una URL válida

const price = joi
  .number()
  .positive()
  .custom((value, helpers) => {
    const decimalPlaces = (value.toString().split(".")[1] || "").length;
    if (decimalPlaces > 2) {
      return helpers.error("any.invalid", {
        message: "price must have at most 2 decimal places",
      });
    }
    return value;
  }, "Precision validation");

// Cambiado a min(0) por si el producto inicia sin existencias físicas
const stock = joi.number().integer().min(0);

exports.validateDataLogin = joi
  .object({
    email: email.required(),
    password: password.required(),
  })
  .unknown(false);
exports.validateDataRegister = joi
  .object({
    name: name.required(),
    email: email.required(),
    password: password.required(),
  })
  .unknown(false);

exports.validateDataEdit = joi
  .object({
    name: name.required(),
    email: email.required(),
    password: password.required(),
  })
  .unknown(false);

// Esquema actualizado para aceptar todos los datos que procesa tu controlador
exports.validateProduct = joi
  .object({
    name: name.required(),
    desc: desc.optional(),
    category: category.optional(),
    price: price.required(),
    img: img.optional(),
    stock: stock.required(),
  })
  .unknown(false);

exports.validateOrderId = joi
  .object({
    id: joi.number().integer().positive().required(),
  })
  .unknown(false);

exports.validateItems = joi
  .object({
    items: joi
      .array()
      .items(
        joi.object({
          productId: joi.number().integer().positive().required(),
          quantity: joi.number().integer().positive().required(),
        }),
      )
      .min(1)
      .required(),
  })
  .unknown(false);

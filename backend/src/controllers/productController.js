const { getProducts, createProduct } = require("../services/productService");
const showProducts = async (req, res, next) => {
  try {
    const products = await getProducts();

    return res.json(products);
  } catch (error) {
    next(error);
  }
};
const addProduct = async (req, res, next) => {
  const { role } = req.user;
  try {
    const { name, desc, category, price, img, stock } = req.body;
    const createdProduct = await createProduct(
      name,
      desc,
      category,
      price,
      img,
      stock,
      role,
    );
    return res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

module.exports = { showProducts, addProduct };

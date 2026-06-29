const orderService = require("../services/orderService");

exports.order = async (req, res, next) => {
  try {
    const clientId = req.user.id;
    console.log(req.user);
    const orden = await orderService.createOrder(clientId);
    return res.json({ orden });
  } catch (error) {
    next(error);
  }
};

exports.addItems = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;

    const clientId = req.user.id;
    const orden = await orderService.addItems(
      clientId,
      parseInt(orderId),
      req.body,
    );

    return res.json(orden);
  } catch (error) {
    next(error);
  }
};
exports.payment = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const clientId = req.user.id;
    await orderService.payment(parseInt(orderId), clientId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
exports.cancel = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const clientId = req.user.id;
    await orderService.cancel(parseInt(orderId), clientId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

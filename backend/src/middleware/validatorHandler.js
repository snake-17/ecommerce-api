const boom = require("@hapi/boom");

function validatorHandler(schema, property) {
  return (req, res, next) => {
    const data = req[property];
    if (!data) {
      return next(boom.badRequest("Data required"));
    }
    const { error } = schema.validate(data);
    if (error) {
      return next(boom.badRequest(error));
    }
    next();
  };
}
module.exports = validatorHandler;

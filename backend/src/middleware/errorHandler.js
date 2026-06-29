function logErrors(err, req, res, next) {
  const statusCode = err.output?.statusCode || err.statusCode || 500;
  const message = err.message || "Something is wrong";
  console.error(
    `[ERROR] ${new Date().toISOString()} - ${statusCode} - ${message}`,
  );
  if (err.stack) {
    console.error(err.stack);
  }
  next(err);
}
function boomErrorHandler(err, req, res, next) {
  if (err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json(output.payload);
  } else {
    next(err);
  }
}
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
module.exports = { logErrors, boomErrorHandler, errorHandler };

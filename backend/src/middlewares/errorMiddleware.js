const notFoundHandler = (req, res, next) => {
  res.status(404).json({ error: `Not Found - ${req.originalUrl}` });
};

const globalErrorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};

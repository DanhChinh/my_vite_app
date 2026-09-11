const { sendError } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'SERVER_ERROR';
  const message = err.message || 'Lỗi hệ thống';

  return sendError(res, message, statusCode, errorCode);
};

module.exports = errorHandler;
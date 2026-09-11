exports.sendSuccess = (res, data = null, message = 'Thao tác thành công', statusCode = 200, meta = null) => {
  const payload = {
    success: true,
    message,
    data
  };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

exports.sendError = (res, message = 'Có lỗi xảy ra', statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) => {
  const payload = {
    success: false,
    error: {
      code: errorCode,
      message
    }
  };
  if (details) payload.error.details = details;
  return res.status(statusCode).json(payload);
};
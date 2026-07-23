const { HTTP_STATUS } = require('../constants');

function notFound(req, res, next) {
  const message = `Không tìm thấy đường dẫn: ${req.originalUrl}`;
  res.status(HTTP_STATUS.NOT_FOUND);
  next(new Error(message));
}

module.exports = notFound;

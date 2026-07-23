const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }));

  next(new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'Dữ liệu không hợp lệ', details));
}

module.exports = validate;

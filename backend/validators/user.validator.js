const { body, param } = require('express-validator');
const { ROLE_VALUES } = require('../constants/roles');

const userIdValidator = [param('id').isMongoId().withMessage('id không hợp lệ (phải là ObjectId)')];

const updateRoleValidator = [
  param('id').isMongoId().withMessage('id không hợp lệ (phải là ObjectId)'),
  body('role')
    .notEmpty()
    .withMessage('role là bắt buộc')
    .bail()
    .isIn(ROLE_VALUES)
    .withMessage(`role phải là một trong: ${ROLE_VALUES.join(', ')}`),
];

const updateStatusValidator = [
  param('id').isMongoId().withMessage('id không hợp lệ (phải là ObjectId)'),
  body('isActive').isBoolean().withMessage('isActive phải là true/false'),
];

module.exports = { userIdValidator, updateRoleValidator, updateStatusValidator };

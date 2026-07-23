const { param } = require('express-validator');

const notificationIdValidator = [param('id').isMongoId().withMessage('id không hợp lệ (phải là ObjectId)')];

module.exports = { notificationIdValidator };

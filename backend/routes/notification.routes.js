const express = require('express');
const { listNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notification.controller');
const { notificationIdValidator } = require('../validators/notification.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, listNotifications);
router.put('/read-all', authenticate, markAllAsRead);
router.put('/:id/read', authenticate, notificationIdValidator, validate, markAsRead);
router.delete('/:id', authenticate, notificationIdValidator, validate, deleteNotification);

module.exports = router;

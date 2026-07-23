const express = require('express');
const { getDashboard } = require('../controllers/dashboard.controller');
const { listUsers, getUserDetail, updateUserRole, updateUserStatus } = require('../controllers/user.controller');
const { updateRoleValidator, updateStatusValidator, userIdValidator } = require('../validators/user.validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/dashboard', getDashboard);

router.get('/users', listUsers);
router.get('/users/:id', userIdValidator, validate, getUserDetail);
router.put('/users/:id/role', updateRoleValidator, validate, updateUserRole);
router.put('/users/:id/status', updateStatusValidator, validate, updateUserStatus);

module.exports = router;

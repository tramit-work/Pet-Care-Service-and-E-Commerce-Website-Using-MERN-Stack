const express = require('express');
const { uploadImage, uploadImages } = require('../controllers/upload.controller');
const { uploadSingleImage, uploadGalleryImages } = require('../middleware/upload.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.post('/image', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), uploadSingleImage, uploadImage);
router.post('/images', authenticate, authorize(ROLES.ADMIN, ROLES.EDITOR), uploadGalleryImages, uploadImages);

router.post('/avatar', authenticate, uploadSingleImage, uploadImage);

module.exports = router;

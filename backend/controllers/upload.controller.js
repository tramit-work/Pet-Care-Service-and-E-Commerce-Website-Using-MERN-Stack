const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants');

function buildFileUrl(req, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/products/${filename}`;
}

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Vui lòng chọn 1 ảnh để upload');
  }

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Upload ảnh thành công',
    data: { url: buildFileUrl(req, req.file.filename) },
  });
});

const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Vui lòng chọn ít nhất 1 ảnh để upload');
  }

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Upload ảnh thành công',
    data: { urls: req.files.map((file) => buildFileUrl(req, file.filename)) },
  });
});

module.exports = { uploadImage, uploadImages };

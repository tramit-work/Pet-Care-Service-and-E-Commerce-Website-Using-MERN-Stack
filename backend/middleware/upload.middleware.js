const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants');


const UPLOAD_DIR = path.join(__dirname, '../uploads/products');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const MAX_GALLERY_FILES = 10; 

function buildStorage() {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `product-${uniqueSuffix}${ext}`);
    },
  });
}

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Chỉ chấp nhận ảnh định dạng JPG, JPEG, PNG hoặc WEBP'));
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage: buildStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

function wrapMulter(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (!err) return next();

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Ảnh vượt quá dung lượng cho phép (tối đa 5MB)'));
        }
        if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(
            new ApiError(HTTP_STATUS.BAD_REQUEST, `Chỉ được upload tối đa ${MAX_GALLERY_FILES} ảnh cùng lúc`)
          );
        }
        return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Upload ảnh thất bại'));
      }

      return next(err);
    });
  };
}

const uploadSingleImage = wrapMulter(upload.single('image'));
const uploadGalleryImages = wrapMulter(upload.array('images', MAX_GALLERY_FILES));

module.exports = { uploadSingleImage, uploadGalleryImages, MAX_GALLERY_FILES };

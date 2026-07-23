const { body } = require('express-validator');

const registerValidator = [
  body('fullName').trim().notEmpty().withMessage('Họ tên là bắt buộc'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email là bắt buộc')
    .bail()
    .isEmail()
    .withMessage('Email không đúng định dạng'),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email là bắt buộc')
    .bail()
    .isEmail()
    .withMessage('Email không đúng định dạng'),
  body('password').notEmpty().withMessage('Mật khẩu là bắt buộc'),
];

// ==== Step 17 ====

const verifyEmailValidator = [body('token').trim().notEmpty().withMessage('Token là bắt buộc')];

const resendVerificationValidator = [
  body('email').trim().notEmpty().withMessage('Email là bắt buộc').bail().isEmail().withMessage('Email không đúng định dạng'),
];

const forgotPasswordValidator = [
  body('email').trim().notEmpty().withMessage('Email là bắt buộc').bail().isEmail().withMessage('Email không đúng định dạng'),
];

const resetPasswordValidator = [
  body('token').trim().notEmpty().withMessage('Token là bắt buộc'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Xác nhận mật khẩu không khớp');
    }
    return true;
  }),
];

const googleAuthValidator = [body('credential').notEmpty().withMessage('Thiếu credential từ Google')];

const changePasswordValidator = [
  body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
];

const updateProfileValidator = [
  body('fullName').optional().trim().notEmpty().withMessage('Họ tên không được để trống'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('avatar').optional().trim(),
];

module.exports = {
  registerValidator,
  loginValidator,
  verifyEmailValidator,
  resendVerificationValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  googleAuthValidator,
  changePasswordValidator,
  updateProfileValidator,
};

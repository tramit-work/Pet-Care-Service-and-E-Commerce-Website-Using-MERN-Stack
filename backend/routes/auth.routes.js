const express = require('express');
const {
  register,
  login,
  adminLogin,
  me,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleAuth,
  refreshAccessToken,
  logout,
  listSessions,
  revokeSession,
  revokeAllSessions,
  changePassword,
  updateProfile,
} = require('../controllers/auth.controller');
const {
  registerValidator,
  loginValidator,
  verifyEmailValidator,
  resendVerificationValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  googleAuthValidator,
  changePasswordValidator,
  updateProfileValidator,
} = require('../validators/auth.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');
const { loginLimiter, registerLimiter, emailActionLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', registerLimiter, registerValidator, validate, register);
router.post('/login', loginLimiter, loginValidator, validate, login);

router.post('/admin-login', loginLimiter, loginValidator, validate, adminLogin);
router.get('/me', authenticate, me);

router.post('/verify-email', verifyEmailValidator, validate, verifyEmail);
router.post('/resend-verification', emailActionLimiter, resendVerificationValidator, validate, resendVerification);

router.post('/forgot-password', emailActionLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

router.post('/google', loginLimiter, googleAuthValidator, validate, googleAuth);

router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.get('/sessions', authenticate, listSessions);
router.delete('/sessions', authenticate, revokeAllSessions);
router.delete('/sessions/:sessionId', authenticate, revokeSession);

router.put('/change-password', authenticate, changePasswordValidator, validate, changePassword);
router.put('/profile', authenticate, updateProfileValidator, validate, updateProfile);

module.exports = router;

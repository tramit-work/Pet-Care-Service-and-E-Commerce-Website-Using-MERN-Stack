const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateRawToken, hashToken } = require('../utils/tokenUtils');
const { parseUserAgent } = require('../utils/parseUserAgent');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const { HTTP_STATUS, ROLES } = require('../constants');

const REFRESH_COOKIE_NAME = 'petcare_refresh_token';
const REFRESH_EXPIRES_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS) || 30;
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const EMAIL_VERIFICATION_EXPIRES_HOURS = Number(process.env.EMAIL_VERIFICATION_EXPIRES_HOURS) || 24;
const PASSWORD_RESET_EXPIRES_MINUTES = Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES) || 60;
const RESEND_VERIFICATION_COOLDOWN_MINUTES = Number(process.env.RESEND_VERIFICATION_COOLDOWN_MINUTES) || 2;

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;


function cookieOptions() {

  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  };
}

function buildDevModeEmailExposure(emailResult, urlKey) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isDevelopment || emailResult.delivered) {
    return {};
  }
  return { developmentMode: true, [urlKey]: emailResult.link };
}

async function authenticateCredentials(email, password) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Email hoặc mật khẩu không đúng');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Email hoặc mật khẩu không đúng');
  }

  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Tài khoản đã bị khóa');
  }

  return user;
}

async function issueTokenPair(req, res, user) {
  user.lastLogin = new Date();

  const now = new Date();
  user.refreshTokens = (user.refreshTokens || []).filter((rt) => rt.expiresAt > now);

  const rawRefreshToken = generateRawToken();
  const expiresAt = new Date(now.getTime() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  user.refreshTokens.push({
    tokenHash: hashToken(rawRefreshToken),
    userAgent: req.headers['user-agent'] || '',
    ipAddress: req.ip || '',
    createdAt: now,
    expiresAt,
  });

  await user.save({ validateBeforeSave: false });

  res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, cookieOptions());

  const accessToken = generateToken({ id: user._id, role: user.role }, ACCESS_TOKEN_EXPIRES_IN);
  return accessToken;
}

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {

    if (existing.googleId) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email này đã được đăng ký bằng Google.');
    }
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Email này đã được đăng ký.');
  }

  const rawToken = generateRawToken();
  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    role: ROLES.USER,
    isVerified: false,
    emailVerificationTokenHash: hashToken(rawToken),
    emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000),
    emailVerificationLastSentAt: new Date(),
  });

  const emailResult = await sendVerificationEmail(user, rawToken);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.',
    ...buildDevModeEmailExposure(emailResult, 'verificationUrl'),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authenticateCredentials(email, password);

  if (user.role !== ROLES.USER) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'Tài khoản này không đăng nhập được tại đây. Vui lòng dùng trang đăng nhập quản trị.'
    );
  }

  if (!user.isVerified) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Vui lòng xác thực email trước khi đăng nhập.', {
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  const accessToken = await issueTokenPair(req, res, user);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Đăng nhập thành công',
    token: accessToken,
    user,
  });
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authenticateCredentials(email, password);

  if (![ROLES.ADMIN, ROLES.EDITOR].includes(user.role)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Tài khoản không có quyền truy cập khu vực quản trị');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken({ id: user._id, role: user.role });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Đăng nhập thành công',
    token,
    user,
  });
});

const me = asyncHandler(async (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    user: req.user,
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const tokenHash = hashToken(token);

  const user = await User.findOne({ emailVerificationTokenHash: tokenHash }).select(
    '+emailVerificationTokenHash +emailVerificationExpires'
  );

  if (!user) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Liên kết xác thực không hợp lệ.');
  }
  if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Liên kết xác thực đã hết hạn. Vui lòng gửi lại email xác thực.', {
      code: 'TOKEN_EXPIRED',
    });
  }

  user.isVerified = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpires = null;
  await user.save({ validateBeforeSave: false });

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.' });
});

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    '+emailVerificationLastSentAt +emailVerificationTokenHash +emailVerificationExpires'
  );

  if (!user) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, một email xác thực mới đã được gửi.',
    });
  }

  if (user.isVerified) {
    return res.status(HTTP_STATUS.OK).json({ success: true, message: 'Tài khoản này đã được xác thực trước đó.' });
  }

  if (user.emailVerificationLastSentAt) {
    const elapsedMs = Date.now() - user.emailVerificationLastSentAt.getTime();
    const cooldownMs = RESEND_VERIFICATION_COOLDOWN_MINUTES * 60 * 1000;
    if (elapsedMs < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
      throw new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, `Vui lòng đợi ${waitSeconds} giây trước khi gửi lại.`);
    }
  }

  const rawToken = generateRawToken();
  user.emailVerificationTokenHash = hashToken(rawToken);
  user.emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000);
  user.emailVerificationLastSentAt = new Date();
  await user.save({ validateBeforeSave: false });

  const emailResult = await sendVerificationEmail(user, rawToken);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Email xác thực mới đã được gửi.',
    ...buildDevModeEmailExposure(emailResult, 'verificationUrl'),
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (user) {
    const rawToken = generateRawToken();
    user.passwordResetTokenHash = hashToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(user, rawToken);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Nếu email tồn tại trong hệ thống, một email đặt lại mật khẩu đã được gửi.',
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const tokenHash = hashToken(token);

  const user = await User.findOne({ passwordResetTokenHash: tokenHash }).select(
    '+passwordResetTokenHash +passwordResetExpires'
  );

  if (!user) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Liên kết đặt lại mật khẩu không hợp lệ.');
  }
  if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.', {
      code: 'TOKEN_EXPIRED',
    });
  }

  user.password = password;
  user.hasPassword = true;
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  user.refreshTokens = [];
  await user.save();

  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' });
});

const googleAuth = asyncHandler(async (req, res) => {
  if (!googleClient) {
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Đăng nhập Google chưa được cấu hình (thiếu GOOGLE_CLIENT_ID).');
  }

  const { credential } = req.body;
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch (err) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Không thể xác thực tài khoản Google.');
  }

  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ googleId });
  if (!user) {
    user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      if (!user.isVerified) user.isVerified = true; // Google đã xác thực email này
      await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        fullName: name || email,
        email,
        googleId,
        avatar: picture || '',
        role: ROLES.USER,
        isVerified: true,
        hasPassword: false,
      });
    }
  }

  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Tài khoản đã bị khóa');
  }

  const accessToken = await issueTokenPair(req, res, user);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Đăng nhập bằng Google thành công',
    token: accessToken,
    user,
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!rawToken) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Không tìm thấy phiên đăng nhập.');
  }

  const tokenHash = hashToken(rawToken);
  const user = await User.findOne({ 'refreshTokens.tokenHash': tokenHash }).select('+refreshTokens');

  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.');
  }

  const entry = user.refreshTokens.find((rt) => rt.tokenHash === tokenHash);
  if (!entry || entry.expiresAt < new Date()) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
  }
  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Tài khoản đã bị khóa');
  }

  user.refreshTokens = user.refreshTokens.filter((rt) => rt.tokenHash !== tokenHash);
  const newRawToken = generateRawToken();
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  user.refreshTokens.push({
    tokenHash: hashToken(newRawToken),
    userAgent: entry.userAgent,
    ipAddress: req.ip || entry.ipAddress,
    createdAt: new Date(),
    expiresAt,
  });
  await user.save({ validateBeforeSave: false });

  res.cookie(REFRESH_COOKIE_NAME, newRawToken, cookieOptions());

  const accessToken = generateToken({ id: user._id, role: user.role }, ACCESS_TOKEN_EXPIRES_IN);
  res.status(HTTP_STATUS.OK).json({ success: true, token: accessToken });
});

const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    await User.updateOne({ 'refreshTokens.tokenHash': tokenHash }, { $pull: { refreshTokens: { tokenHash } } });
  }

  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Đã đăng xuất' });
});

const listSessions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+refreshTokens');
  const currentRawToken = req.cookies?.[REFRESH_COOKIE_NAME];
  const currentHash = currentRawToken ? hashToken(currentRawToken) : null;

  const sessions = (user.refreshTokens || [])
    .map((rt) => {
      const { browser, os } = parseUserAgent(rt.userAgent);
      return {
        id: rt._id,
        browser,
        os,
        ipAddress: rt.ipAddress || null,
        createdAt: rt.createdAt,
        expiresAt: rt.expiresAt,
        isCurrent: rt.tokenHash === currentHash,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.status(HTTP_STATUS.OK).json({ success: true, data: sessions });
});

const revokeSession = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { refreshTokens: { _id: req.params.sessionId } } });
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Đã thu hồi phiên đăng nhập.' });
});

const revokeAllSessions = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $set: { refreshTokens: [] } });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Đã đăng xuất khỏi tất cả thiết bị.' });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (user.password) {
    if (!currentPassword) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Vui lòng nhập mật khẩu hiện tại.');
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Mật khẩu hiện tại không đúng.');
    }
  }

  user.password = newPassword;
  user.hasPassword = true;
  await user.save();

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Đổi mật khẩu thành công.' });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone, address, avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (fullName !== undefined) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Cập nhật hồ sơ thành công', user });
});

module.exports = {
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
};

const xss = require('xss');

const SKIP_KEY_PATTERN = /password|token|credential/i;

function sanitizeValue(value, key) {
  if (key && SKIP_KEY_PATTERN.test(key)) {
    return value;
  }
  if (typeof value === 'string') {
    return xss(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, key));
  }
  if (value && typeof value === 'object') {
    const result = {};
    Object.keys(value).forEach((childKey) => {
      result[childKey] = sanitizeValue(value[childKey], childKey);
    });
    return result;
  }
  return value;
}

function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body, null);
  }
  next();
}

module.exports = sanitizeInput;

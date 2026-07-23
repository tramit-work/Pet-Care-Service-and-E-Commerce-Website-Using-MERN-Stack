const jwt = require('jsonwebtoken');

function generateToken({ id, role }, expiresIn) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = generateToken;

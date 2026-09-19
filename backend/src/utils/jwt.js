const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'xeroxpress_jwt_secret_dev_key_2026_super_secure';
const JWT_EXPIRES_IN = '7d';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};

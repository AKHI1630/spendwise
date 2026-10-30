const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'spendwise_super_secure_jwt_fallback_key_2026';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;


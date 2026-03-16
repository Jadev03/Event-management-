const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const issueJwt = (req, res) => {
  const user = req.authUser;

  if (!user) {
    logger.error('issueJwt called without authUser on request');
    return res.status(500).json({ message: 'Authentication state not found' });
  }

  const payload = {
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  logger.info('JWT issued for user', { email: user.email, role: user.role });

  return res.status(200).json({
    message: 'Login successful',
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
};

module.exports = {
  issueJwt,
};


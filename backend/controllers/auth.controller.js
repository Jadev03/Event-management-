const { authenticateUser } = require('../services/auth.service');
const { logger } = require('../utils/logger');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      logger.warn('Login attempt with missing credentials', { email });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      logger.warn('Invalid login attempt', { email });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    req.authUser = user;

    logger.info('User authenticated successfully', {
      email: user.email,
      role: user.role,
    });

    return next();
  } catch (error) {
    logger.error('Error during login', { message: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  login,
};


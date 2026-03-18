const { authenticateUser } = require('../services/auth.service');
const { logger } = require('../utils/logger');
const bcrypt = require('bcrypt');
const { User } = require('../models/user.model');

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

const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { oldPassword, newPassword, confirmPassword } = req.body || {};

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'Old password, new password, and confirm password are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: 'New password and confirm password do not match' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isOldMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isOldMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    logger.info('Password changed successfully', { userId });
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Error during changePassword', { message: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  login,
  changePassword,
};


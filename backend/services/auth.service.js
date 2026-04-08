const bcrypt = require('bcrypt');
const { User } = require('../models/user.model');

const AUTH_FAILURE_REASON = {
  USER_NOT_FOUND: 'user_not_found',
  DEACTIVATED: 'deactivated',
  INVALID_PASSWORD: 'invalid_password',
};

const authenticateUserDetailed = async (email, password) => {
  const normalizedEmail = (email || '').trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return { ok: false, reason: AUTH_FAILURE_REASON.USER_NOT_FOUND };
  }

  // Admin accounts must never be deactivated. If DB has a bad state, self-heal it.
  if (user.role === 'admin' && user.isDeactivated) {
    user.isDeactivated = false;
    user.deactivatedAt = null;
    user.deactivatedReason = null;
    user.failedLoginAttempts = 0;
    await user.save();
  }

  if (user.isDeactivated) {
    return { ok: false, reason: AUTH_FAILURE_REASON.DEACTIVATED, user };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { ok: false, reason: AUTH_FAILURE_REASON.INVALID_PASSWORD, user };
  }

  return { ok: true, user };
};

module.exports = {
  authenticateUserDetailed,
  AUTH_FAILURE_REASON,
};


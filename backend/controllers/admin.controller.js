const bcrypt = require('bcrypt');
const { User, USER_ROLES } = require('../models/user.model');
const { Event } = require('../models/event.model');
const { logger } = require('../utils/logger');

const generateRandomPassword = (length = 8) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';

  for (let i = 0; i < length; i += 1) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  return password;
};

const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, role, password } = req.body || {};

    if (!name || !email || !role) {
      return res
        .status(400)
        .json({ message: 'Name, email and role are required' });
    }

    const normalizedEmail = email.trim();

    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({
        message:
          'Invalid role. Allowed roles are: student, organizer, facultyCoordinator',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'A user with this email already exists' });
    }

    const plainPassword =
      typeof password === 'string' && password.trim()
        ? password.trim()
        : generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      role,
      password: hashedPassword,
    });

    logger.info('Admin created a new user with generated password', {
      createdUserId: user._id.toString(),
      email: user.email,
      role: user.role,
      generatedPassword: plainPassword,
    });

    return res.status(201).json({
      message: 'User created successfully',
      generatedPassword: plainPassword,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error creating user by admin', { message: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select('name email role createdAt updatedAt')
      .lean();

    return res.status(200).json({
      users: (users || []).map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
    });
  } catch (error) {
    logger.error('Error listing users', { message: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getMonthlyEventStatusAnalytics = async (req, res) => {
  try {
    const monthsBackRaw = Number.parseInt(req.query?.months || '6', 10);
    const monthsBack = Number.isFinite(monthsBackRaw)
      ? Math.min(Math.max(monthsBackRaw, 1), 24)
      : 6;

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);
    const endExclusive = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const agg = await Event.aggregate([
      { $match: { createdAt: { $gte: start, $lt: endExclusive } } },
      {
        $group: {
          _id: {
            y: { $year: '$createdAt' },
            m: { $month: '$createdAt' },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]);

    const monthName = (monthIndex0) =>
      new Date(2000, monthIndex0, 1).toLocaleString(undefined, {
        month: 'short',
      });

    const keyFor = (y, m1) => `${y}-${String(m1).padStart(2, '0')}`;
    const buckets = new Map();
    for (const row of agg || []) {
      const y = row?._id?.y;
      const m1 = row?._id?.m;
      const status = row?._id?.status;
      const count = row?.count || 0;
      if (!y || !m1 || !status) continue;

      const key = keyFor(y, m1);
      const cur =
        buckets.get(key) || {
          key,
          month: `${monthName(m1 - 1)} ${y}`,
          pendingApprovals: 0,
          accepted: 0,
          rejected: 0,
          completed: 0,
        };

      if (status === 'pending') cur.pendingApprovals += count;
      else if (status === 'approved') cur.accepted += count;
      else if (status === 'rejected') cur.rejected += count;
      else if (status === 'completed') cur.completed += count;

      buckets.set(key, cur);
    }

    const series = [];
    for (let i = 0; i < monthsBack; i += 1) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const y = d.getFullYear();
      const m1 = d.getMonth() + 1;
      const key = keyFor(y, m1);
      series.push(
        buckets.get(key) || {
          key,
          month: `${monthName(m1 - 1)} ${y}`,
          pendingApprovals: 0,
          accepted: 0,
          rejected: 0,
          completed: 0,
        },
      );
    }

    return res.status(200).json({
      months: monthsBack,
      series,
    });
  } catch (error) {
    logger.error('Error building monthly event analytics', {
      message: error.message,
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createUserByAdmin,
  listUsers,
  getMonthlyEventStatusAnalytics,
};


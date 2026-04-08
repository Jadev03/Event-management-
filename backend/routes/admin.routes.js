const express = require('express');
const {
  createUserByAdmin,
  listUsers,
  updateUserByAdmin,
  getMonthlyEventStatusAnalytics,
} = require('../controllers/admin.controller');

const router = express.Router();

// Admin can create users with roles: student, organizer, facultyCoordinator
router.post('/users', createUserByAdmin);
router.get('/users', listUsers);
router.put('/users/:id', updateUserByAdmin);
router.patch('/users/:id', updateUserByAdmin);
router.get('/analytics/events-by-month', getMonthlyEventStatusAnalytics);

module.exports = router;


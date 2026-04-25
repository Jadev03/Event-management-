const express = require('express');
const {
  createUserByAdmin,
  listUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
  getMonthlyEventStatusAnalytics,
  getMonthlyLoginTrafficAnalytics,
  deactivateUserByAdmin,
  activateUserByAdmin,
  markLoginSecurityAlertRead,
} = require('../controllers/admin.controller');

const router = express.Router();

// Admin can create users with roles: student, organizer, facultyCoordinator
router.post('/users', createUserByAdmin);
router.get('/users', listUsers);
router.put('/users/:id', updateUserByAdmin);
router.patch('/users/:id', updateUserByAdmin);
router.delete('/users/:id', deleteUserByAdmin);
router.post('/users/:id/deactivate', deactivateUserByAdmin);
router.post('/users/:id/activate', activateUserByAdmin);
router.post('/users/:id/login-security-alert/read', markLoginSecurityAlertRead);
router.get('/analytics/events-by-month', getMonthlyEventStatusAnalytics);
router.get('/analytics/login-traffic-by-month', getMonthlyLoginTrafficAnalytics);

module.exports = router;


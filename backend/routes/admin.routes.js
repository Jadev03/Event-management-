const express = require('express');
const { createUserByAdmin } = require('../controllers/admin.controller');

const router = express.Router();

// Admin can create users with roles: student, organizer, facultyCoordinator
router.post('/users', createUserByAdmin);

module.exports = router;


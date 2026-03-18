const express = require('express');
const { login, changePassword } = require('../controllers/auth.controller');
const {
  issueJwt,
  refreshAccessToken,
  logout,
  authenticate,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', login, issueJwt);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.put('/change-password', authenticate, changePassword);

module.exports = router;


const express = require('express');
const { login } = require('../controllers/auth.controller');
const {
  issueJwt,
  refreshAccessToken,
  logout,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', login, issueJwt);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

module.exports = router;


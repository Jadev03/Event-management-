const express = require('express');
const { login } = require('../controllers/auth.controller');
const { issueJwt } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', login, issueJwt);

module.exports = router;


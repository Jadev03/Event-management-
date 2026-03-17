const express = require('express');
const { createEvent, listMyEvents } = require('../controllers/event.controller');

const router = express.Router();

// Organizer event endpoints
router.post('/', createEvent);
router.get('/mine', listMyEvents);

module.exports = router;


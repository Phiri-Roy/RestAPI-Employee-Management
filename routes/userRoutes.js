const express = require('express');
const router = express.Router();
const { signup } = require('../controllers/userController');

// Public route for user signup
router.post('/signup', signup);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); 
const { registerUser, loginUser, updateUser } = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', loginUser);

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Protected
router.put('/profile', auth, updateUser);

module.exports = router;
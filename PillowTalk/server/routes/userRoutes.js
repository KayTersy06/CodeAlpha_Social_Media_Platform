const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all users
router.get('/', userController.getAllUsers);

// Search users
router.get('/search', userController.searchUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user
router.put('/:id', authMiddleware, userController.updateUser);

module.exports = router;

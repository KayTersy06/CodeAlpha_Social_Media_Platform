const express = require('express');
const followController = require('../controllers/followController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.post('/:userId', authMiddleware, followController.followUser);
router.delete('/:userId', authMiddleware, followController.unfollowUser);

module.exports = router;

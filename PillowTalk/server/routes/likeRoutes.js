const express = require('express');
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.post('/:postId', authMiddleware, likeController.likePost);
router.delete('/:postId', authMiddleware, likeController.unlikePost);

module.exports = router;

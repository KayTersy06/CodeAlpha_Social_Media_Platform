const pool = require('../db');

const likeController = {
  likePost: async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (!postId || isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      const postCheck = await pool.query('SELECT post_id FROM posts WHERE post_id = $1', [postId]);
      if (postCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const existingLike = await pool.query('SELECT like_id FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
      if (existingLike.rows.length > 0) {
        return res.status(409).json({ message: 'Post already liked' });
      }

      const result = await pool.query(`
        INSERT INTO likes (post_id, user_id)
        VALUES ($1, $2)
        RETURNING like_id, post_id, user_id
      `, [postId, userId]);

      res.status(201).json({ message: 'Post liked successfully', like: result.rows[0] });
    } catch (err) {
      console.error('Like post error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  unlikePost: async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (!postId || isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      const result = await pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2 RETURNING like_id', [postId, userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Like not found' });
      }

      res.status(200).json({ message: 'Post unliked successfully' });
    } catch (err) {
      console.error('Unlike post error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
};

module.exports = likeController;

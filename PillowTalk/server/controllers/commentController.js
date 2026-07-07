const pool = require('../db');

const commentController = {
  getCommentsByPostId: async (req, res) => {
    try {
      const { postId } = req.params;
      if (!postId || isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      const result = await pool.query(`
        SELECT c.comment_id, c.comment, c.created_at,
               u.user_id, u.full_name, u.username, u.profile_picture
        FROM comments c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.post_id = $1
        ORDER BY c.created_at ASC
      `, [postId]);

      res.status(200).json({ message: 'Comments retrieved successfully', comments: result.rows });
    } catch (err) {
      console.error('Get comments error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  createComment: async (req, res) => {
    try {
      const { postId, comment } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (!postId || isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }
      if (!comment || comment.trim() === '') {
        return res.status(400).json({ message: 'Comment is required' });
      }

      const postCheck = await pool.query('SELECT post_id FROM posts WHERE post_id = $1', [postId]);
      if (postCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const result = await pool.query(`
        INSERT INTO comments (post_id, user_id, comment)
        VALUES ($1, $2, $3)
        RETURNING comment_id, post_id, user_id, comment, created_at
      `, [postId, userId, comment.trim()]);

      res.status(201).json({ message: 'Comment created successfully', comment: result.rows[0] });
    } catch (err) {
      console.error('Create comment error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  updateComment: async (req, res) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid comment ID' });
      }
      if (!comment || comment.trim() === '') {
        return res.status(400).json({ message: 'Comment is required' });
      }

      const existingComment = await pool.query('SELECT user_id FROM comments WHERE comment_id = $1', [id]);
      if (existingComment.rows.length === 0) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      if (existingComment.rows[0].user_id !== userId) {
        return res.status(403).json({ message: 'You can only edit your own comments' });
      }

      const result = await pool.query(`
        UPDATE comments
        SET comment = $1
        WHERE comment_id = $2
        RETURNING comment_id, post_id, user_id, comment, created_at
      `, [comment.trim(), id]);

      res.status(200).json({ message: 'Comment updated successfully', comment: result.rows[0] });
    } catch (err) {
      console.error('Update comment error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  deleteComment: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid comment ID' });
      }

      const existingComment = await pool.query('SELECT user_id FROM comments WHERE comment_id = $1', [id]);
      if (existingComment.rows.length === 0) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      if (existingComment.rows[0].user_id !== userId) {
        return res.status(403).json({ message: 'You can only delete your own comments' });
      }

      await pool.query('DELETE FROM comments WHERE comment_id = $1', [id]);
      res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
      console.error('Delete comment error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
};

module.exports = commentController;

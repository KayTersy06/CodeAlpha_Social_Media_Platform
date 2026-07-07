const pool = require('../db');

const postController = {
  getAllPosts: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT p.post_id, p.content, p.image_url, p.created_at,
               u.user_id, u.full_name, u.username, u.profile_picture
        FROM posts p
        JOIN users u ON p.user_id = u.user_id
        ORDER BY p.created_at DESC
      `);
      res.status(200).json({ message: 'Posts retrieved successfully', posts: result.rows });
    } catch (err) {
      console.error('Get all posts error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  getPostById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      const result = await pool.query(`
        SELECT p.post_id, p.content, p.image_url, p.created_at,
               u.user_id, u.full_name, u.username, u.profile_picture
        FROM posts p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.post_id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.status(200).json({ message: 'Post retrieved successfully', post: result.rows[0] });
    } catch (err) {
      console.error('Get post by ID error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  createPost: async (req, res) => {
    try {
      const { content, imageUrl } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Post content is required' });
      }

      const result = await pool.query(`
        INSERT INTO posts (user_id, content, image_url)
        VALUES ($1, $2, $3)
        RETURNING post_id, user_id, content, image_url, created_at
      `, [userId, content.trim(), imageUrl || null]);

      res.status(201).json({ message: 'Post created successfully', post: result.rows[0] });
    } catch (err) {
      console.error('Create post error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  updatePost: async (req, res) => {
    try {
      const { id } = req.params;
      const { content, imageUrl } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }
      if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Post content is required' });
      }

      const existingPost = await pool.query('SELECT user_id FROM posts WHERE post_id = $1', [id]);
      if (existingPost.rows.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      if (existingPost.rows[0].user_id !== userId) {
        return res.status(403).json({ message: 'You can only update your own posts' });
      }

      const result = await pool.query(`
        UPDATE posts
        SET content = $1, image_url = $2
        WHERE post_id = $3
        RETURNING post_id, user_id, content, image_url, created_at
      `, [content.trim(), imageUrl || null, id]);

      res.status(200).json({ message: 'Post updated successfully', post: result.rows[0] });
    } catch (err) {
      console.error('Update post error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  deletePost: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      const existingPost = await pool.query('SELECT user_id FROM posts WHERE post_id = $1', [id]);
      if (existingPost.rows.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      if (existingPost.rows[0].user_id !== userId) {
        return res.status(403).json({ message: 'You can only delete your own posts' });
      }

      await pool.query('DELETE FROM posts WHERE post_id = $1', [id]);
      res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
      console.error('Delete post error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
};

module.exports = postController;

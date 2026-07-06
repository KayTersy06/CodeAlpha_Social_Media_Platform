const pool = require('../db');
const User = require('../models/User');

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT user_id, full_name, username, email, bio, profile_picture, created_at FROM users ORDER BY created_at DESC'
      );
      res.status(200).json({
        message: 'Users retrieved successfully',
        count: result.rows.length,
        users: result.rows
      });
    } catch (err) {
      console.error('Get all users error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'User retrieved successfully',
        user
      });
    } catch (err) {
      console.error('Get user by ID error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, username, bio, profilePicture } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Check if user exists
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (fullName !== undefined) {
        updates.push(`full_name = $${paramCount++}`);
        values.push(fullName);
      }
      if (username !== undefined) {
        updates.push(`username = $${paramCount++}`);
        values.push(username);
      }
      if (bio !== undefined) {
        updates.push(`bio = $${paramCount++}`);
        values.push(bio);
      }
      if (profilePicture !== undefined) {
        updates.push(`profile_picture = $${paramCount++}`);
        values.push(profilePicture);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
      }

      values.push(id);

      const result = await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${paramCount} RETURNING user_id, full_name, username, email, bio, profile_picture, created_at`,
        values
      );

      res.status(200).json({
        message: 'User updated successfully',
        user: result.rows[0]
      });
    } catch (err) {
      console.error('Update user error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  searchUsers: async (req, res) => {
    try {
      const { query } = req.query;

      if (!query || query.trim() === '') {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const searchTerm = `%${query.trim()}%`;

      const result = await pool.query(
        `SELECT user_id, full_name, username, email, bio, profile_picture, created_at 
         FROM users 
         WHERE full_name ILIKE $1 OR username ILIKE $2 OR email ILIKE $3 
         ORDER BY full_name ASC`,
        [searchTerm, searchTerm, searchTerm]
      );

      res.status(200).json({
        message: 'Users found',
        count: result.rows.length,
        users: result.rows
      });
    } catch (err) {
      console.error('Search users error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
};

module.exports = userController;

const pool = require('../db');

const followController = {
  followUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const followerId = req.userId;

      if (!followerId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      if (Number(userId) === followerId) {
        return res.status(400).json({ message: 'You cannot follow yourself' });
      }

      const targetUser = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [userId]);
      if (targetUser.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const existingFollow = await pool.query('SELECT follow_id FROM followers WHERE follower_id = $1 AND following_id = $2', [followerId, userId]);
      if (existingFollow.rows.length > 0) {
        return res.status(409).json({ message: 'You are already following this user' });
      }

      const result = await pool.query(`
        INSERT INTO followers (follower_id, following_id)
        VALUES ($1, $2)
        RETURNING follow_id, follower_id, following_id
      `, [followerId, userId]);

      res.status(201).json({ message: 'User followed successfully', follow: result.rows[0] });
    } catch (err) {
      console.error('Follow user error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  unfollowUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const followerId = req.userId;

      if (!followerId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const result = await pool.query('DELETE FROM followers WHERE follower_id = $1 AND following_id = $2 RETURNING follow_id', [followerId, userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Follow relationship not found' });
      }

      res.status(200).json({ message: 'User unfollowed successfully' });
    } catch (err) {
      console.error('Unfollow user error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
};

module.exports = followController;

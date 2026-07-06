const pool = require('../db');
const bcrypt = require('bcrypt');

class User {
  static async create(fullName, username, email, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (full_name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING user_id, full_name, username, email, created_at',
        [fullName, username, email, hashedPassword]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async findByEmail(email) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async findById(userId) {
    try {
      const result = await pool.query(
        'SELECT user_id, full_name, username, email, bio, profile_picture, created_at FROM users WHERE user_id = $1',
        [userId]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async validatePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = User;

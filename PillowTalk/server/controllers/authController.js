const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authController = {
  register: async (req, res) => {
    try {
      const { fullName, username, email, password, confirmPassword } = req.body;

      // Validation
      if (!fullName || !username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Create user
      const newUser = await User.create(fullName, username, email, password);

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.user_id, email: newUser.email },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          userId: newUser.user_id,
          fullName: newUser.full_name,
          username: newUser.username,
          email: newUser.email,
          createdAt: newUser.created_at
        }
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Validate password
      const isPasswordValid = await User.validatePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.user_id, email: user.email },
        process.env.JWT_SECRET || 'pillow_talk_secret_key',
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          userId: user.user_id,
          fullName: user.full_name,
          username: user.username,
          email: user.email
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  getProfile: async (req, res) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'Profile retrieved successfully',
        user
      });
    } catch (err) {
      console.error('Get profile error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
};

module.exports = authController;

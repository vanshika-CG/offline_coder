const express = require('express');
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');
const Question = require('../models/Question');
const Submission = require('../models/Submission');

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user
// @access  Admin
router.get('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('solvedQuestions')
      .populate('achievements');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/questions
// @desc    Get all questions
// @access  Admin
router.get('/questions', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments();

    res.json({
      success: true,
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/questions/:id
// @desc    Delete question
// @access  Admin
router.delete('/questions/:id', protect, admin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.deleteOne();

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Admin
router.get('/analytics', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    const activeUsers = await User.countDocuments({
      lastActiveDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const successfulSubmissions = await Submission.countDocuments({
      status: 'Accepted'
    });

    const difficultyStats = await Question.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentSubmissions = await Submission.find()
      .populate('userId', 'name email')
      .populate('questionId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalQuestions,
        totalSubmissions,
        activeUsers,
        successfulSubmissions,
        difficultyStats,
        recentSubmissions
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

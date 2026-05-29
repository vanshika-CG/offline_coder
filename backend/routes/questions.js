const express = require('express');
const { protect, admin } = require('../middleware/auth');
const Question = require('../models/Question');
const Note = require('../models/Note');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/questions
// @desc    Save a new question (for browser extension)
// @access  Public (with API key in production)
router.post('/', async (req, res) => {
  try {
    const { title, description, starterCode, difficulty, tags, examples, constraints } = req.body;

    const question = await Question.create({
      title,
      description,
      starterCode: starterCode || { cpp: '', java: '', python: '', javascript: '' },
      difficulty: difficulty || 'Medium',
      tags: tags || [],
      examples: examples || [],
      constraints: constraints || []
    });

    res.status(201).json({
      success: true,
      question
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/questions
// @desc    Get all questions with pagination, search, sort, filter
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, difficulty, tags, sort } = req.query;

    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Difficulty filter
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Tags filter
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    // Sort options
    let sortOption = {};
    if (sort === 'difficulty') {
      sortOption = { difficulty: 1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const questions = await Question.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(query);

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

// @route   GET /api/questions/:id
// @desc    Get single question
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Get user's note for this question
    const note = await Note.findOne({
      userId: req.user._id,
      questionId: req.params.id
    });

    res.json({
      success: true,
      question: {
        ...question.toObject(),
        userNote: note ? note.content : ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update question
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    Object.assign(question, req.body);
    await question.save();

    res.json({
      success: true,
      question
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete question
// @access  Admin
router.delete('/:id', protect, admin, async (req, res) => {
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

// @route   PUT /api/questions/:id/solve
// @desc    Mark question as solved
// @access  Private
router.put('/:id/solve', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (!question.solvedBy.includes(req.user._id)) {
      question.solvedBy.push(req.user._id);
      question.isSolved = true;
      await question.save();

      user.solvedQuestions.push(question._id);
      await user.save();
    }

    res.json({
      success: true,
      question
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/questions/:id/bookmark
// @desc    Bookmark/unbookmark question
// @access  Private
router.put('/:id/bookmark', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const index = question.bookmarkedBy.indexOf(req.user._id);
    if (index > -1) {
      question.bookmarkedBy.splice(index, 1);
      question.isBookmarked = false;
    } else {
      question.bookmarkedBy.push(req.user._id);
      question.isBookmarked = true;
    }

    await question.save();

    res.json({
      success: true,
      question
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/questions/stats/overview
// @desc    Get question statistics
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalQuestions = await Question.countDocuments();
    const solvedQuestions = await Question.countDocuments({ solvedBy: userId });
    const bookmarkedQuestions = await Question.countDocuments({ bookmarkedBy: userId });

    const easyCount = await Question.countDocuments({ difficulty: 'Easy' });
    const mediumCount = await Question.countDocuments({ difficulty: 'Medium' });
    const hardCount = await Question.countDocuments({ difficulty: 'Hard' });

    const solvedEasy = await Question.countDocuments({ difficulty: 'Easy', solvedBy: userId });
    const solvedMedium = await Question.countDocuments({ difficulty: 'Medium', solvedBy: userId });
    const solvedHard = await Question.countDocuments({ difficulty: 'Hard', solvedBy: userId });

    res.json({
      success: true,
      stats: {
        totalQuestions,
        solvedQuestions,
        bookmarkedQuestions,
        difficulty: {
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount
        },
        solvedByDifficulty: {
          easy: solvedEasy,
          medium: solvedMedium,
          hard: solvedHard
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

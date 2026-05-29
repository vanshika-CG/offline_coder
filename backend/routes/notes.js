const express = require('express');
const { protect } = require('../middleware/auth');
const Note = require('../models/Note');

const router = express.Router();

// @route   POST /api/notes
// @desc    Create or update note for a question
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { questionId, content } = req.body;

    if (!questionId) {
      return res.status(400).json({ message: 'Question ID is required' });
    }

    // Check if note exists
    let note = await Note.findOne({
      userId: req.user._id,
      questionId
    });

    if (note) {
      // Add to edit history before updating
      note.editHistory.push({
        content: note.content,
        editedAt: new Date()
      });

      // Keep only last 10 edits
      if (note.editHistory.length > 10) {
        note.editHistory = note.editHistory.slice(-10);
      }

      note.content = content;
      await note.save();
    } else {
      note = await Note.create({
        userId: req.user._id,
        questionId,
        content: content || ''
      });
    }

    res.json({
      success: true,
      note
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/notes
// @desc    Get all user notes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id })
      .populate('questionId', 'title difficulty tags')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      notes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/notes/:questionId
// @desc    Get note for specific question
// @access  Private
router.get('/:questionId', protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      userId: req.user._id,
      questionId: req.params.questionId
    });

    res.json({
      success: true,
      note: note || { content: '' }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/notes/:questionId
// @desc    Delete note
// @access  Private
router.delete('/:questionId', protect, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      userId: req.user._id,
      questionId: req.params.questionId
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/notes/:questionId/history
// @desc    Get edit history for a note
// @access  Private
router.get('/:questionId/history', protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      userId: req.user._id,
      questionId: req.params.questionId
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({
      success: true,
      history: note.editHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

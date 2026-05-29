const express = require('express');
const { protect } = require('../middleware/auth');
const Revision = require('../models/Revision');

const router = express.Router();

// @route   POST /api/revisions
// @desc    Create a new revision list
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, questions, topic } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Revision list name is required' });
    }

    const revision = await Revision.create({
      userId: req.user._id,
      name,
      description: description || '',
      questions: questions || [],
      topic: topic || ''
    });

    res.status(201).json({
      success: true,
      revision
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/revisions
// @desc    Get all user revision lists
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const revisions = await Revision.find({ userId: req.user._id })
      .populate('questions', 'title difficulty tags')
      .sort({ lastRevised: -1 });

    res.json({
      success: true,
      revisions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/revisions/:id
// @desc    Get single revision list
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const revision = await Revision.findById(req.params.id)
      .populate('questions', 'title difficulty tags description');

    if (!revision) {
      return res.status(404).json({ message: 'Revision list not found' });
    }

    if (revision.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      revision
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/revisions/:id
// @desc    Update revision list
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const revision = await Revision.findById(req.params.id);

    if (!revision) {
      return res.status(404).json({ message: 'Revision list not found' });
    }

    if (revision.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(revision, req.body);
    await revision.save();

    res.json({
      success: true,
      revision
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/revisions/:id/revise
// @desc    Mark revision list as revised
// @access  Private
router.put('/:id/revise', protect, async (req, res) => {
  try {
    const revision = await Revision.findById(req.params.id);

    if (!revision) {
      return res.status(404).json({ message: 'Revision list not found' });
    }

    if (revision.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    revision.lastRevised = new Date();
    revision.revisionCount += 1;
    await revision.save();

    res.json({
      success: true,
      revision
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/revisions/:id
// @desc    Delete revision list
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const revision = await Revision.findById(req.params.id);

    if (!revision) {
      return res.status(404).json({ message: 'Revision list not found' });
    }

    if (revision.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await revision.deleteOne();

    res.json({
      success: true,
      message: 'Revision list deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

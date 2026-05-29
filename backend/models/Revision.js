const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a revision list name'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  topic: {
    type: String,
    trim: true
  },
  lastRevised: {
    type: Date,
    default: Date.now
  },
  revisionCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Revision', revisionSchema);

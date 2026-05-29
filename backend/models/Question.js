const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: [true, 'Please provide difficulty']
  },
  tags: [{
    type: String,
    trim: true
  }],
  starterCode: {
    type: Map,
    of: String,
    default: {
      cpp: '',
      java: '',
      python: '',
      javascript: ''
    }
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [{
    type: String
  }],
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isSolved: {
    type: Boolean,
    default: false
  },
  isBookmarked: {
    type: Boolean,
    default: false
  },
  solvedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  companyTags: [{
    type: String
  }],
  timeComplexity: String,
  spaceComplexity: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
questionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Question', questionSchema);

const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an achievement name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  icon: {
    type: String,
    default: '🏆'
  },
  condition: {
    type: String,
    enum: ['first_solve', 'ten_solves', 'hundred_solves', 'seven_day_streak', 'thirty_day_streak', 'all_difficulties', 'perfect_score'],
    required: true
  },
  requirement: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Achievement', achievementSchema);

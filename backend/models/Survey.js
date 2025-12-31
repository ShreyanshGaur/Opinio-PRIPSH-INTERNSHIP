const mongoose = require('mongoose');

const SurveySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  questions: [
    {
      questionText: String,
      questionType: { type: String, default: 'text' },
      options: [String],
      required: { type: Boolean, default: true } // <--- ADD THIS (Default to true)
    }
  ],
  expiresAt: {
    type: Date,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Survey', SurveySchema);
const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  survey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  // We store answers as an array containing the question ID and the answer given
  answers: [{
    questionId: String,
    answer: mongoose.Schema.Types.Mixed // Mixed because answer can be a string ("Yes") or an array (["Red", "Blue"])
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Response', ResponseSchema);
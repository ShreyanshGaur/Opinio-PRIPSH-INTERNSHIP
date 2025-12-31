const Survey = require('../models/Survey');
const Response = require('../models/Response'); 

// @desc    Create a new survey
// @route   POST /api/surveys
exports.createSurvey = async (req, res) => {
  try {
    const { title, description, questions, expiresAt } = req.body;

    const newSurvey = new Survey({
      user: req.user.id,
      title,
      description,
      questions,
      expiresAt: expiresAt || null // Save expiry date if provided
    });

    const survey = await newSurvey.save();
    res.json(survey);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all surveys created by the current user
// @route   GET /api/surveys/my-surveys
exports.getUserSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(surveys);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get a single public survey by ID (for taking it)
// @route   GET /api/surveys/public/:id
exports.getPublicSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ msg: 'Survey not found' });

    // CHECK EXPIRY: If current date is past the expiry date, block access
    if (survey.expiresAt && new Date() > new Date(survey.expiresAt)) {
        return res.status(423).json({ msg: 'This survey has expired.' }); // 423 = Locked
    }

    res.json(survey);
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Survey not found' });
    res.status(500).send('Server Error');
  }
};

// @desc    Get Survey Results (Protected)
// @route   GET /api/surveys/results/:id
exports.getSurveyResults = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    
    // Check if survey exists
    if (!survey) return res.status(404).json({ msg: 'Survey not found' });

    // Security Check: Ensure the user requesting this OWNS the survey
    if (survey.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not Authorized" });
    }

    const responses = await Response.find({ survey: req.params.id });
    
    res.json({ survey, responses });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a survey and all its responses
// @route   DELETE /api/surveys/:id
exports.deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);

    // 1. Check if survey exists
    if (!survey) {
      return res.status(404).json({ msg: 'Survey not found' });
    }

    // 2. Check if user owns the survey
    if (survey.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // 3. Delete all responses associated with this survey first (Clean up)
    await Response.deleteMany({ survey: req.params.id });

    // 4. Delete the survey itself
    await Survey.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Survey removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a survey
// @route   PUT /api/surveys/:id
exports.updateSurvey = async (req, res) => {
  try {
    const { title, description, questions, expiresAt } = req.body;
    let survey = await Survey.findById(req.params.id);

    if (!survey) return res.status(404).json({ msg: 'Survey not found' });

    // Check user authorization
    if (survey.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update fields
    survey.title = title;
    survey.description = description;
    survey.questions = questions;
    survey.expiresAt = expiresAt; // Update expiry date

    await survey.save();
    res.json(survey);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
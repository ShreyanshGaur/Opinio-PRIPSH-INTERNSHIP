const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { 
  createSurvey, 
  getUserSurveys, 
  getPublicSurvey, 
  getSurveyResults,
  deleteSurvey,
  updateSurvey // <--- Import update function
} = require('../controllers/surveyController');

const Response = require('../models/Response'); 

// Protected Routes (User must be logged in)
router.post('/', auth, createSurvey);
router.get('/my-surveys', auth, getUserSurveys);
router.get('/results/:id', auth, getSurveyResults);
router.delete('/:id', auth, deleteSurvey); 
router.put('/:id', auth, updateSurvey); // <--- Add PUT route

// Public Routes (Anyone can see these)
router.get('/public/:id', getPublicSurvey);

// Public Route to submit a response
router.post('/response', async (req, res) => {
  try {
    const newResponse = new Response(req.body);
    await newResponse.save();
    res.json({ msg: "Response saved" });
  } catch (err) { 
    console.error(err);
    res.status(500).json(err); 
  }
});

module.exports = router;
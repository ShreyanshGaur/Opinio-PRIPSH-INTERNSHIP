require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// 1. Connect to Database
connectDB();

// 2. Init Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON bodies from requests

// 3. Define Routes
app.use('/api/auth', require('./routes/authRoutes'));       // Register & Login
app.use('/api/surveys', require('./routes/surveyRoutes'));  // Create & Read Surveys

// 4. Basic Test Route
app.get('/', (req, res) => res.send('Opinio API is running'));

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
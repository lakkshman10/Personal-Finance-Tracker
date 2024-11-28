// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Make sure this path is correct
require('dotenv').config(); // Load .env file

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // Ensure this line is in place

// Connect to MongoDB
const MONGO_URI = process.env.MONGODB_URL;
if (!MONGO_URI) {
  console.error('Error: MONGODB_URL is not defined in the environment variables');
  process.exit(1); // Exit the app
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error: ', err));

// Start the server
app.listen(5000, () => console.log('Server is running on port 5000'));

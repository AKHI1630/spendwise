// Vercel serverless entry point
require('dotenv').config();
const connectDB = require('../backend/config/db');

let cachedApp = null;

module.exports = async (req, res) => {
  try {
    if (!cachedApp) {
      await connectDB();
      cachedApp = require('../backend/server');
    }
    return cachedApp(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error in SpendWise API',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

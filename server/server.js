// server/server.js
// 1) Load env FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Routes
const authRoutes = require('./routes/authRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const skillRoutes = require('./routes/skillRoutes');
const projectRoutes = require('./routes/projectRoutes');
const publicPortfolioRoutes = require('./routes/publicPortfolioRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health route
app.get('/', (_req, res) => res.send('API is running...'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/public-portfolio', publicPortfolioRoutes);

// --- MongoDB connection ---
async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!MONGO_URI) {
    console.error('❌ Missing MONGO_URI/MONGODB_URI in .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

// --- Cloudinary config ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
console.log('✅ Cloudinary Configured');

// --- Start server after DB connects ---
async function start() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down...');
    try {
      await mongoose.connection.close();
    } catch (e) {
      console.error('Error closing Mongo connection:', e);
    }
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();

// Optional: catch unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

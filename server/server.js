// server/server.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Routes
const authRoutes = require("./routes/authRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const skillRoutes = require('./routes/skillRoutes');
const projectRoutes = require('./routes/projectRoutes');
const publicPortfolioRoutes = require('./routes/publicPortfolioRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health route
app.get("/", (_req, res) => res.send("API is running..."));

app.use("/api/auth", authRoutes);
app.use("/api/certificates", certificateRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/public-portfolio', publicPortfolioRoutes);

// ---- Mongo & server boot ----
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI/MONGODB_URI in .env");
  process.exit(1);
}

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    const server = app.listen(PORT, () =>
      console.log(`🚀 Server started on http://localhost:${PORT}`)
    );

    // Graceful shutdown
    const shutdown = async () => {
      console.log("\nShutting down...");
      await mongoose.connection.close();
      server.close(() => process.exit(0));
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

start();

// Optional: catch unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

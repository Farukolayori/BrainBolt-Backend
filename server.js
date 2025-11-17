require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: "*", // Allow all during development
  credentials: true
}));

// Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    
    // Use local MongoDB as fallback
    const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quizapp";
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.log("❌ Error connecting to MongoDB: ", error.message);
    console.log("💡 TIP: Make sure MongoDB is running locally");
    console.log("💡 For Windows: MongoDB should be running as a service");
    console.log("💡 For Mac: Run 'brew services start mongodb-community'");
    process.exit(1);
  }
};

// Import routes with error handling
let authRoutes, scoresRoutes, favouritesRoutes;

try {
  authRoutes = require("./routes/auth");
  console.log("✅ Auth routes loaded");
} catch (error) {
  console.log("❌ Auth routes not found:", error.message);
}

try {
  scoresRoutes = require("./routes/scores");
  console.log("✅ Scores routes loaded");
} catch (error) {
  console.log("❌ Scores routes not found - creating basic route");
  // Create basic scores route if file doesn't exist
  scoresRoutes = express.Router();
  scoresRoutes.post("/", (req, res) => {
    res.json({ success: true, message: "Scores route - add implementation" });
  });
  scoresRoutes.get("/", (req, res) => {
    res.json({ success: true, scores: [] });
  });
}

try {
  favouritesRoutes = require("./routes/favourites");
  console.log("✅ Favourites routes loaded");
} catch (error) {
  console.log("❌ Favourites routes not found - creating basic route");
  // Create basic favourites route if file doesn't exist
  favouritesRoutes = express.Router();
  favouritesRoutes.get("/", (req, res) => {
    res.json({ success: true, favourites: [] });
  });
  favouritesRoutes.post("/", (req, res) => {
    res.json({ success: true, message: "Favourites route - add implementation" });
  });
  favouritesRoutes.delete("/:id", (req, res) => {
    res.json({ success: true, message: "Favourite removed" });
  });
}

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/scores", scoresRoutes);
app.use("/api/favourites", favouritesRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "🚀 Backend server is running!",
    database: mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected ❌",
    timestamp: new Date().toISOString(),
    routes: {
      auth: "/api/auth",
      scores: "/api/scores",
      favourites: "/api/favourites"
    }
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ 
    success: true,
    message: "✅ API is working!",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route not found: ${req.method} ${req.url}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error' 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  connectDB();
  console.log(`\n🎉 Server successfully started!`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Network: http://192.168.37.78:${PORT}`);
  console.log(`📱 API: http://localhost:${PORT}/api`);
  console.log(`🔧 Test: http://localhost:${PORT}/api/test`);
  console.log(`\n📋 Available routes:`);
  console.log(`   POST /api/auth/signup`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/scores`);
  console.log(`   POST /api/scores`);
  console.log(`   GET  /api/favourites`);
  console.log(`   POST /api/favourites`);
  console.log(`   DELETE /api/favourites/:id`);
});
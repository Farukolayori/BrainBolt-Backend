const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.userId = user.userId;
    next();
  });
};

// Save quiz score
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { score, category } = req.body;

    if (score === undefined || !category) {
      return res.status(400).json({ 
        success: false,
        message: "Score and category are required" 
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    user.scores.push({ score, category });
    await user.save();

    res.status(201).json({
      success: true,
      message: "Score saved successfully",
      score: user.scores[user.scores.length - 1],
    });
  } catch (error) {
    console.error("Score save error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error saving score" 
    });
  }
});

// Get all scores for a user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("scores");
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    res.json({ 
      success: true,
      scores: user.scores 
    });
  } catch (error) {
    console.error("Scores fetch error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching scores" 
    });
  }
});

module.exports = router;
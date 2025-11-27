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

// ✅ UPDATED: Save quiz score and award diamonds
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { score, category, correctAnswers } = req.body;

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

    // ✅ Calculate diamonds earned (5 per correct answer)
    const diamondsEarned = (correctAnswers || 0) * 5;

    // Add score to user's scores array with correctAnswers
    user.scores.push({ 
      score, 
      category,
      correctAnswers: correctAnswers || 0 // ✅ Store correct answers
    });

    // ✅ Award diamonds to user
    user.diamonds = (user.diamonds || 0) + diamondsEarned;

    await user.save();

    res.status(201).json({
      success: true,
      message: "Score saved successfully",
      score: user.scores[user.scores.length - 1],
      diamondsEarned, // ✅ Return diamonds earned this quiz
      totalDiamonds: user.diamonds, // ✅ Return total diamonds
    });
  } catch (error) {
    console.error("Score save error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error saving score" 
    });
  }
});

// ✅ UPDATED: Get all scores for a user (including diamonds)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("scores diamonds");
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    res.json({ 
      success: true,
      scores: user.scores,
      diamonds: user.diamonds || 0 // ✅ Include diamonds in response
    });
  } catch (error) {
    console.error("Scores fetch error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching scores" 
    });
  }
});

// ✅ NEW: Get user's diamond balance only
router.get("/diamonds", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("diamonds");
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    res.json({ 
      success: true,
      diamonds: user.diamonds || 0
    });
  } catch (error) {
    console.error("Diamonds fetch error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching diamonds" 
    });
  }
});

module.exports = router;
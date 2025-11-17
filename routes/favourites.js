// Add to backend/routes/favourites.js
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

// Get user favorites
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("favourites");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, favourites: user.favourites });
  } catch (error) {
    console.error("Get favourites error:", error);
    res.status(500).json({ success: false, message: "Server error fetching favourites" });
  }
});

// Add to favorites
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { question, options, answer, id } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if already favorited
    const exists = user.favourites.some(fav => 
      fav.id ? fav.id === id : fav.question === question
    );

    if (exists) {
      return res.status(400).json({ success: false, message: "Already in favourites" });
    }

    user.favourites.push({ question, options, answer, id });
    await user.save();

    res.status(201).json({ 
      success: true, 
      message: "Added to favourites",
      favourites: user.favourites 
    });
  } catch (error) {
    console.error("Add favourite error:", error);
    res.status(500).json({ success: false, message: "Server error adding favourite" });
  }
});

// Remove from favorites
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.favourites = user.favourites.filter(fav => 
      (fav.id && fav.id !== id) || (!fav.id && fav.question !== id)
    );
    
    await user.save();

    res.json({ 
      success: true, 
      message: "Removed from favourites",
      favourites: user.favourites 
    });
  } catch (error) {
    console.error("Remove favourite error:", error);
    res.status(500).json({ success: false, message: "Server error removing favourite" });
  }
});

module.exports = router;
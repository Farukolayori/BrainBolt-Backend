const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/User')
const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, fullName, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "User already exists with this email" 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      email,
      fullName,
      password: hashedPassword,
      diamonds: 0, // ✅ Initialize diamonds at 0
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id }, 
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data (without password)
    const userResponse = {
      id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      scores: newUser.scores,
      diamonds: newUser.diamonds, // ✅ Include diamonds
      createdAt: newUser.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data (without password)
    const userResponse = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      scores: user.scores,
      diamonds: user.diamonds || 0, // ✅ Include diamonds (with fallback)
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

module.exports = router;
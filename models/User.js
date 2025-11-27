const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  scores: [
    {
      score: { type: Number, required: true },
      category: { type: String, required: true },
      correctAnswers: { type: Number, default: 0 }, // ✅ NEW: Track correct answers
      date: { type: Date, default: Date.now },
    },
  ],
  favourites: [
    {
      question: { type: String, required: true },
      options: [{ type: String }],
      answer: { type: String, required: true },
      id: { type: String },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  diamonds: { 
    type: Number, 
    default: 0 // ✅ NEW: User's diamond balance
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
const mongoose = require("mongoose");

// In your User model, add favourites array:
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
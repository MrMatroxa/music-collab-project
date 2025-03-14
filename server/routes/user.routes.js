const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

// Get all users (for admin purposes) - consider adding admin-only middleware
router.get("/", isAuthenticated, (req, res, next) => {
  User.find()
    .select("-password") // Exclude password from results
    .then((usersFromDB) => res.status(200).json(usersFromDB))
    .catch((err) => next(err));
});

// Get user by ID
router.get("/:userId", (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .select("-password") // Exclude password from results
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    })
    .catch((err) => next(err));
});

// Update user profile - requires authentication
router.put("/:userId", isAuthenticated, (req, res, next) => {
  const { userId } = req.params;

  // Ensure users can only update their own profile
  if (userId !== req.payload._id) {
    return res
      .status(403)
      .json({ message: "You can only update your own profile" });
  }

  // Remove password from request body if it exists
  const { password, ...updateData } = req.body;

  User.findByIdAndUpdate(userId, updateData, { new: true })
    .select("-password") // Exclude password from results
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(updatedUser);
    })
    .catch((err) => next(err));
});

// Delete user - requires authentication
router.delete("/:userId", isAuthenticated, (req, res, next) => {
  const { userId } = req.params;

  // Ensure users can only delete their own profile
  if (userId !== req.payload._id) {
    return res
      .status(403)
      .json({ message: "You can only delete your own account" });
  }

  User.findByIdAndDelete(userId)
    .then((deletedUser) => {
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    })
    .catch((err) => next(err));
});

// Get user's projects
router.get("/:userId/projects", (req, res, next) => {
  const { userId } = req.params;

  const Project = require("../models/Project.model");

  Project.find({ creator: userId })
    .then((projects) => {
      res.status(200).json(projects);
    })
    .catch((err) => next(err));
});

// Get user's sounds
router.get("/:userId/sounds", (req, res, next) => {
  const { userId } = req.params;

  const Sound = require("../models/Sound.model");

  Sound.find({ creator: userId })
    .then((sounds) => {
      res.status(200).json(sounds);
    })
    .catch((err) => next(err));
});

module.exports = router;

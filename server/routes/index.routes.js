const express = require("express");
const router = express.Router();

// Import other route files
const authRoutes = require("./auth.routes");
const projectRoutes = require("./projects.routes");
const userRoutes = require("./user.routes");
const soundsRoutes = require("./sounds.routes");
const tagsRoutes = require("./tags.routes");

// Define the home/base route
router.get("/", (req, res, next) => {
  res.json("Welcome to the Music Collaboration API");
});

// Set up route prefixes
router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/users", userRoutes);
router.use("/sounds", soundsRoutes);
router.use("/tags", tagsRoutes);

// API status route
router.get("/status", (req, res) => {
  res.status(200).json({
    status: "active",
    message: "API is running normally",
    timestamp: new Date()
  });
});

// Catch-all route for undefined API endpoints
router.all("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`
  });
});

module.exports = router;
const express = require("express");
const router = express.Router();

const Project = require("../models/Project.model");

// Get all projects
router.get("/", (req, res, next) => {
  Project.find()
    .then((projectsfromDB) => res.status(200).json(projectsfromDB))
    .catch((err) => next(err));
});

// Get a single project by ID
router.get("/:projectId", (req, res, next) => {
  const { projectId } = req.params;

  Project.findById(projectId)
    .then((project) => {
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(200).json(project);
    })
    .catch((err) => next(err));
});

// Create a new project
router.post("/", (req, res, next) => {
  Project.create(req.body)
    .then((createdProject) => {
      res.status(201).json(createdProject);
    })
    .catch((err) => next(err));
});

// Update a project by ID
router.put("/:projectId", (req, res, next) => {
  const { projectId } = req.params;

  Project.findByIdAndUpdate(projectId, req.body, { new: true })
    .then((updatedProject) => {
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(200).json(updatedProject);
    })
    .catch((err) => next(err));
});

// Delete a project by ID
router.delete("/:projectId", (req, res, next) => {
  const { projectId } = req.params;

  Project.findByIdAndDelete(projectId)
    .then((deletedProject) => {
      if (!deletedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(200).json({ message: "Project deleted successfully" });
    })
    .catch((err) => next(err));
});

module.exports = router;
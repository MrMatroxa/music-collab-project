const express = require("express");
const router = express.Router();

const Tag = require("../models/Tag.model");

// Create a new tag
router.post("/", (req, res, next) => {
  const { name } = req.body;

  Tag.create({ name })
    .then((createdTag) => res.status(201).json(createdTag))
    .catch((err) => next(err));
});

// Get all tags
router.get("/", (req, res, next) => {
  Tag.find()
    .then((tags) => res.status(200).json(tags))
    .catch((err) => next(err));
});

// Get a single tag by ID and populate sounds
router.get("/:tagId", (req, res, next) => {
  const { tagId } = req.params;

  Tag.findById(tagId)
    .populate("sound") // Populate the sounds associated with the tag
    .then((tag) => {
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      res.status(200).json(tag);
    })
    .catch((err) => next(err));
});

// Update a tag
router.put("/:tagId", (req, res, next) => {
  const { tagId } = req.params;
  const { name } = req.body;

  Tag.findByIdAndUpdate(tagId, { name }, { new: true })
    .then((updatedTag) => res.status(200).json(updatedTag))
    .catch((err) => next(err));
});

// Delete a tag
router.delete("/:tagId", (req, res, next) => {
  const { tagId } = req.params;

  Tag.findByIdAndDelete(tagId)
    .then(() => res.status(200).json({ message: "Tag deleted successfully" }))
    .catch((err) => next(err));
});

module.exports = router;
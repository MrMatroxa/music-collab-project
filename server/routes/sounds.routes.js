const express = require("express");
const router = express.Router();

const Sound = require("../models/Sound.model");
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

const fileUploader = require("../config/cloudinary.config");
const Tag = require("../models/Tag.model.js");

// Upload sound file to cloudinary
router.post("/upload", fileUploader.single("soundURL"), (req, res, next) => {
  if (!req.file) {
    next(new Error("No file uploaded!"));
    return;
  }

  res.json({
    fileUrl: req.file.path,
  });
});

// Get all sounds
router.get("/", (req, res, next) => {
  Sound.find({})
    .populate("creator", "-password -email -_id -__v")
    .populate("tags")
    .then((soundsFromDB) => res.status(200).json(soundsFromDB))
    .catch((err) => next(err));
});

// Get sounds by category
router.get("/category/:category", (req, res, next) => {
  const { category } = req.params;

  Sound.find({ category })
    .populate("creator", "username email")
    .then((sounds) => res.status(200).json(sounds))
    .catch((err) => next(err));
});

router.get("/search", (req, res, next) => {
  const { query } = req.query;

  // Check if query parameter exists
  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  Sound.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { tags: { $regex: query, $options: "i" } },
    ],
  })
    .populate("creator", "username email")
    .then((sounds) => {
      res.status(200).json(sounds);
    })
    .catch((err) => next(err));
});

// Get a single sound by ID
router.get("/:soundId", (req, res, next) => {
  const { soundId } = req.params;

  Sound.findById(soundId)
    .populate("creator", "username email")
    .then((sound) => {
      if (!sound) {
        return res.status(404).json({ message: "Sound not found" });
      }
      res.status(200).json(sound);
    })
    .catch((err) => next(err));
});

// Create a new sound
router.post("/", isAuthenticated, async (req, res, next) => {
  // Add the current user as the creator
  const { tags, ...rest } = req.body;
  const newSound = {
    ...rest,
    creator: req.payload._id,
  };

  try {
    const createdSound = await Sound.create(newSound);
    if (tags.length) {
      for (const tag of tags) {
        const foundTag = await Tag.findOne({ name: tag });
        if (foundTag) {
          foundTag.sound.push(createdSound._id);
          await foundTag.save();
          createdSound.tags.push(foundTag._id);
          continue;
        }
        const createdTag = await Tag.create({
          name: tag,
          sound: [createdSound._id],
        });
        createdSound.tags.push(createdTag._id);
      }
      await createdSound.save();
      const populatedSound = createdSound.populate("creator", "username email");
      res.status(201).json(populatedSound);
    }
  } catch (err) {
    next(err);
  }

  // Sound.create(newSound)
  //   .then((createdSound) => {
  //     return Sound.findById(createdSound._id).populate(
  //       "creator",
  //       "username email"
  //     );
  //   })
  //   .then((populatedSound) => {
  //     res.status(201).json(populatedSound);
  //   })
  //   .catch((err) => next(err));
});

// Update a sound
router.put("/:soundId", isAuthenticated, (req, res, next) => {
  const { soundId } = req.params;

  // Check if user is the creator or has admin rights first
  Sound.findById(soundId)
    .then((sound) => {
      if (!sound) {
        return res.status(404).json({ message: "Sound not found" });
      }

      // Check if user is the creator of the sound
      if (sound.creator.toString() !== req.payload._id) {
        return res
          .status(403)
          .json({ message: "You don't have permission to update this sound" });
      }

      // Update the sound
      return Sound.findByIdAndUpdate(soundId, req.body, { new: true }).populate(
        "creator",
        "username email"
      );
    })
    .then((updatedSound) => {
      res.status(200).json(updatedSound);
    })
    .catch((err) => next(err));
});

// Delete a sound
router.delete("/:soundId", isAuthenticated, (req, res, next) => {
  const { soundId } = req.params;

  // Check if user is the creator or has admin rights first
  Sound.findById(soundId)
    .then((sound) => {
      if (!sound) {
        return res.status(404).json({ message: "Sound not found" });
      }

      // Check if user is the creator of the sound
      if (sound.creator.toString() !== req.payload._id) {
        return res
          .status(403)
          .json({ message: "You don't have permission to delete this sound" });
      }

      // Delete the sound
      return Sound.findByIdAndDelete(soundId);
    })
    .then(() => {
      res.status(200).json({ message: "Sound deleted successfully" });
    })
    .catch((err) => next(err));
});

// Get all sounds by a specific user
router.get("/user/:userId", (req, res, next) => {
  const { userId } = req.params;

  Sound.find({ creator: userId })
    .populate("creator", "username email")
    .then((sounds) => {
      res.status(200).json(sounds);
    })
    .catch((err) => next(err));
});

// Search sounds

module.exports = router;

const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary.config");

const Sound = require("../models/Sound.model");
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

const fileUploader = require("../config/cloudinary.config");
const Tag = require("../models/Tag.model.js");
const User = require("../models/User.model.js");
const Project = require("../models/Project.model.js");

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
    .populate("creator", "-password -email _id -__v")
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
    .populate("creator", "name")
    .then((sounds) => {
      res.status(200).json(sounds);
    })
    .catch((err) => next(err));
});

// Get a single sound by ID
router.get("/:soundId", (req, res, next) => {
  const { soundId } = req.params;

  Sound.findById(soundId)
    .populate("creator", "name _id")
    .then((sound) => {
      console.log("sound:::::", sound);
      if (!sound) {
        return res.status(404).json({ message: "Sound not found" });
      }
      res.status(200).json(sound);
    })
    .catch((err) => next(err));
});

// Create a new sound
router.post("/", isAuthenticated, async (req, res, next) => {
  try {
    // Add the current user as the creator
    const { tags = [], projectId = [], ...rest } = req.body;
    const newSound = {
      ...rest,
      creator: req.payload._id,
      projectId: projectId, // Make sure projectId is properly assigned
    };


    // Create the sound first
    const createdSound = await Sound.create(newSound);
    console.log("Sound created with ID:", createdSound._id);

    // Process tags if any
    if (tags && tags.length > 0) {
      const tagPromises = tags.map(async (tagName) => {
        let tag = await Tag.findOne({ name: tagName.toLowerCase() });
        if (!tag) {
          tag = await Tag.create({
            name: tagName.toLowerCase(),
            sound: [createdSound._id],
          });
        } else {
          // Add this sound to existing tag
          if (!tag.sound.includes(createdSound._id)) {
            tag.sound.push(createdSound._id);
            await tag.save();
          }
        }
        return tag._id;
      });

      // Resolve all tag promises
      const tagIds = await Promise.all(tagPromises);

      // Add tags to sound
      createdSound.tags = tagIds;
      await createdSound.save();
    }

    // Create new project and add sound to it
    const createdProject = await Project.create({
      title: createdSound.title + " Project",
      soundId: [createdSound._id],
      creator: createdSound.creator._id,
      masterSoundId: createdSound._id,
    });
    createdSound.projectId.push(createdProject._id);
    await createdSound.save();

    // Return populated sound
    const populatedSound = await Sound.findById(createdSound._id)
      .populate("creator", "name")
      .populate("tags")
      .populate("projectId");

    console.log("Sending populated sound:", populatedSound);
    res.status(201).json(populatedSound);
  } catch (err) {
    console.error("Error creating sound:", err);
    next(err);
  }
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
        "name"
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
      return cloudinary.v2.uploader
        .destroy(public_id, options)
        .then(() => Sound.findByIdAndDelete(soundId))
        .then(() => {
          Tag.findOneAndUpdate([
            { sound: soundId },
            { $pull: { sound: soundId } },
          ]);
        })
        .then(() => {
          Project.findOneAndUpdate([
            { soundId: soundId },
            { $pull: { soundId: soundId } },
          ]);
        })
        .then(() =>
          User.find({ createdSounds: soundId, favoriteSounds: soundId })
        )
        .then(async (foundUsers) => {
          for (const user of foundUsers) {
            user.createdSounds.pull(soundId);
            user.favoriteSounds.pull(soundId);
            await user.save();
          }
        });
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
    .populate("creator", "name")
    .populate("tags")
    .then((sounds) => {
      res.status(200).json(sounds);
    })
    .catch((err) => next(err));
});

// Search sounds

module.exports = router;

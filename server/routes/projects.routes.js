const express = require("express");
const router = express.Router();

const Project = require("../models/Project.model");
const { isAuthenticated } = require("../middleware/jwt.middleware.js");
const archiver = require("archiver");
// Get all projects
router.get("/", (req, res, next) => {
  Project.find()
    .populate("creator", "name")
    .populate("members", "name")
    .populate("soundId")
    .then((projectsFromDB) => res.status(200).json(projectsFromDB))
    .catch((err) => next(err));
});

// Get a single project by ID
router.get("/:projectId", (req, res, next) => {
  const { projectId } = req.params;

  Project.findById(projectId)
    .populate({
      path: "soundId",
      populate: [
        {
          path: "tags", // Populate the tags within each sound
          model: "Tag", // Specify the model to use for population
        },
        {
          path: "creator",
          model: "User",
          select: "-password -email -__v",
        },
      ],
    })
    .populate({
      path: "creator",
      model: "User",
      select: "-password -email -__v",
    })
    .populate("members", "name")

    .then((project) => {
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(200).json(project);
    })
    .catch((err) => next(err));
});

// Get related projects (sharing the same master sound)
router.get("/related/:masterSoundId", isAuthenticated, (req, res, next) => {
  const { masterSoundId } = req.params;

  console.log("Getting related projects for masterSoundId:", masterSoundId);

  Project.find({
    $or: [
      { masterSoundId: masterSoundId },
      { soundId: masterSoundId }, // Also find projects that have this sound directly
    ],
  })
    .populate("creator", "name")
    .populate("members", "name")
    .populate("soundId")
    .then((projects) => {
      console.log(`Found ${projects.length} related projects`);
      res.status(200).json(projects);
    })
    .catch((err) => next(err));
});

// Get family tree for a project
router.get("/family-tree/:masterSoundId", (req, res, next) => {
  const { masterSoundId } = req.params;

  Project.find({ masterSoundId: masterSoundId })
    .populate("creator", "name")
    .populate("soundId")
    .then((projects) => {
      // Sort projects by creation date to show evolution
      projects.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      res.status(200).json(projects);
    })
    .catch((err) => next(err));
});

// Create a new project
router.post("/", isAuthenticated, (req, res, next) => {
  // Add the current user as the creator
  const newProject = {
    ...req.body,
    creator: req.payload._id,
  };

  Project.create(newProject)
    .then((createdProject) => {
      return Project.findById(createdProject._id)
        .populate("creator", "name")
        .populate("soundId");
    })
    .then((populatedProject) => {
      res.status(201).json(populatedProject);
    })
    .catch((err) => next(err));
});

router.post("/related", isAuthenticated, (req, res, next) => {
  // Ensure creator is explicitly set - using the one from the request body
  const newProject = {
    ...req.body,
    creator: req.body.creator, // Keep the creator from the request (original project's creator)
  };

  // Add the current user as a member if they're not already in the members list
  if (!newProject.members) {
    newProject.members = [req.payload._id];
  } else if (!newProject.members.includes(req.payload._id)) {
    // Make sure current user is a member
    if (Array.isArray(newProject.members)) {
      newProject.members.push(req.payload._id);
    } else {
      newProject.members = [newProject.members, req.payload._id];
    }
  }

  Project.create(newProject)
    .then((createdProject) => {
      return Project.findById(createdProject._id)
        .populate("creator", "name")
        .populate("soundId");
    })
    .then((populatedProject) => {
      res.status(201).json(populatedProject);
    })
    .catch((err) => next(err));
});

// Update a project
router.put("/:projectId", isAuthenticated, (req, res, next) => {
  const { projectId } = req.params;

  // Check if user is the creator or a member first
  Project.findById(projectId)
    .then((project) => {
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user is the creator or a member of the project
      const isCreator =
        project.creator && project.creator.toString() === req.payload._id;
      const isMember =
        project.members &&
        project.members.some(
          (member) => member && member.toString() === req.payload._id
        );

      if (!isCreator && !isMember) {
        return res.status(403).json({
          message: "You don't have permission to update this project",
        });
      }

      // Update the project
      return Project.findByIdAndUpdate(projectId, req.body, { new: true })
        .populate("creator", "name")
        .populate("members", "name")
        .populate("soundId");
    })
    .then((updatedProject) => {
      res.status(200).json(updatedProject);
    })
    .catch((err) => next(err));
});

// Delete a project
router.delete("/:projectId", isAuthenticated, (req, res, next) => {
  const { projectId } = req.params;

  // Check if user is the creator
  Project.findById(projectId)
    .then((project) => {
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Only creator can delete projects
      if (project.creator.toString() !== req.payload._id) {
        return res.status(403).json({
          message: "You don't have permission to delete this project",
        });
      }

      // Delete the project
      return Project.findByIdAndDelete(projectId);
    })
    .then(() => {
      res.status(200).json({ message: "Project deleted successfully" });
    })
    .catch((err) => next(err));
});

// Get all projects by a specific user (either created or member)
router.get("/user/:userId", (req, res, next) => {
  const { userId } = req.params;

  Project.find({
    $or: [{ creator: userId }, { members: userId }],
  })
    .populate("creator", "name")
    .populate("members", "name")
    .populate("soundId")
    .then((projects) => {
      res.status(200).json(projects);
    })
    .catch((err) => next(err));
});

// Search projects
router.get("/search/:query", (req, res, next) => {
  const { query } = req.params;

  Project.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  })
    .populate("creator", "name")
    .populate("members", "name")
    .populate("soundId")
    .then((projects) => {
      res.status(200).json(projects);
    })
    .catch((err) => next(err));
});

router.get("/download-project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const cloudinary = require("../config/cloudinary.config").v2;

    // Log to verify we have the correct object
    console.log("Cloudinary object:", !!cloudinary, !!cloudinary.uploader);

    // Rest of your code remains the same
    const project = await Project.findById(projectId).populate("soundId");

    if (!project || !project.soundId || project.soundId.length === 0) {
      return res
        .status(404)
        .json({ message: "No sounds found in this project" });
    }

    // Create a unique tag for this download
    const downloadTag = `project_${projectId}_${Date.now()}`;

    // Extract public_ids from the Cloudinary URLs
    const public_ids = project.soundId
      .filter((sound) => sound && sound.soundURL)
      .map((sound) => {
        try {
          
          const url = new URL(sound.soundURL);
          const pathParts = url.pathname.split("/");

          // Find the position after 'upload' in the path
          const uploadIndex = pathParts.indexOf("upload");
          if (uploadIndex === -1) return null;

          // Get everything after 'upload', excluding version number (v1234567890)
          const version = pathParts[uploadIndex + 1];
          if (version.startsWith("v")) {
            // Join all parts after version and before file extension
            const fullPublicId = pathParts.slice(uploadIndex + 2).join("/");
            return fullPublicId.split(".")[0]; // Remove file extension
          } else {
            // If no version in URL, just take everything after upload
            const fullPublicId = pathParts.slice(uploadIndex + 1).join("/");
            return fullPublicId.split(".")[0]; // Remove file extension
          }
        } catch (err) {
          console.error(
            `Error extracting public_id from URL: ${sound.soundURL}`,
            err
          );
          return null;
        }
      })
      .filter((id) => id !== null);

    console.log("Extracted public_ids:", public_ids);

    if (public_ids.length === 0) {
      return res
        .status(404)
        .json({ message: "Could not extract valid sound IDs" });
    }

    // Create the ZIP file using Cloudinary
    const result = await cloudinary.uploader.create_zip({
      public_ids: public_ids,
      resource_type: "video",
      tags: downloadTag,
      expires_at: Math.floor(Date.now() / 1000) + 86400,
    });

    console.log("Cloudinary ZIP created:", result);

    // Make sure to return the response
    return res.redirect(result.url);
  } catch (error) {
    console.error("Error creating ZIP file:", error);
    res.status(500).json({ message: "Server error while creating ZIP file" });
  }
});

// Add a member to a project
router.post(
  "/:projectId/members/:userId",
  isAuthenticated,
  (req, res, next) => {
    const { projectId, userId } = req.params;

    Project.findById(projectId)
      .then((project) => {
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }

        // Check if user is the creator
        const isCreator =
          project.creator && project.creator.toString() === req.payload._id;

        if (!isCreator) {
          return res
            .status(403)
            .json({ message: "Only project creator can add members" });
        }

        // Check if user is already a member
        const itemExists =
          project.members &&
          project.members.some(
            (member) => member && member.toString() === userId
          );

        if (itemExists) {
          return res
            .status(400)
            .json({ message: "User is already a member of this project" });
        }

        // Add the user as a member
        project.members.push(userId);
        return project.save();
      })
      .then((updatedProject) => {
        return Project.findById(updatedProject._id)
          .populate("creator", "name")
          .populate("members", "name")
          .populate("soundId");
      })
      .then((populatedProject) => {
        res.status(200).json(populatedProject);
      })
      .catch((err) => next(err));
  }
);

// Remove a member from a project
router.delete(
  "/:projectId/members/:userId",
  isAuthenticated,
  (req, res, next) => {
    const { projectId, userId } = req.params;

    Project.findById(projectId)
      .then((project) => {
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }

        // Check if user is the creator or the member requesting to leave
        const isCreator =
          project.creator && project.creator.toString() === req.payload._id;

        if (!isCreator && userId !== req.payload._id) {
          return res.status(403).json({
            message: "You don't have permission to remove this member",
          });
        }

        // Remove the user from members
        project.members =
          project.members &&
          project.members.filter(
            (member) => member && member.toString() !== userId
          );
        return project.save();
      })
      .then((updatedProject) => {
        return Project.findById(updatedProject._id)
          .populate("creator", "name")
          .populate("members", "name")
          .populate("soundId");
      })
      .then((populatedProject) => {
        res.status(200).json(populatedProject);
      })
      .catch((err) => next(err));
  }
);

// Add a sound to a project
router.post(
  "/:projectId/sounds/:soundId",
  isAuthenticated,
  (req, res, next) => {
    const { projectId, soundId } = req.params;

    Project.findById(projectId)
      .then((project) => {
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }

        // Check if user is the creator or a member
        const isCreator =
          project.creator && project.creator.toString() === req.payload._id;
        const isMember =
          project.members &&
          project.members.some(
            (member) => member && member.toString() === req.payload._id
          );

        if (!isCreator && !isMember) {
          return res.status(403).json({
            message: "You don't have permission to add sounds to this project",
          });
        }

        // Check if sound is already in the project
        const itemExists =
          project.soundId &&
          project.soundId.some((id) => id && id.toString() === soundId);

        if (itemExists) {
          return res
            .status(400)
            .json({ message: "Sound is already in this project" });
        }

        // Add the sound
        project.soundId.push(soundId);
        return project.save();
      })
      .then((updatedProject) => {
        return Project.findById(updatedProject._id)
          .populate("creator", "name")
          .populate("members", "name")
          .populate("soundId");
      })
      .then((populatedProject) => {
        res.status(200).json(populatedProject);
      })
      .catch((err) => next(err));
  }
);

// Remove a sound from a project
router.delete(
  "/:projectId/sounds/:soundId",
  isAuthenticated,
  (req, res, next) => {
    const { projectId, soundId } = req.params;

    Project.findById(projectId)
      .then((project) => {
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }

        // Check if user is the creator or a member
        const isCreator =
          project.creator && project.creator.toString() === req.payload._id;
        const isMember =
          project.members &&
          project.members.some(
            (member) => member && member.toString() === req.payload._id
          );

        if (!isCreator && !isMember) {
          return res.status(403).json({
            message:
              "You don't have permission to remove sounds from this project",
          });
        }

        // Remove the sound
        project.soundId =
          project.soundId &&
          project.soundId.filter((id) => id && id.toString() !== soundId);
        return project.save();
      })
      .then((updatedProject) => {
        return Project.findById(updatedProject._id)
          .populate("creator", "name")
          .populate("members", "name")
          .populate("soundId");
      })
      .then((populatedProject) => {
        res.status(200).json(populatedProject);
      })
      .catch((err) => next(err));
  }
);

module.exports = router;

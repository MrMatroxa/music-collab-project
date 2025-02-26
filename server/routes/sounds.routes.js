const express = require("express");
const router = express.Router();

const Sound = require("../models/Sound.model");

const fileUploader = require("../config/cloudinary.config");

router.post("/upload", fileUploader.single("soundURL"), (req, res, next) => {
  if (!req.file) {
    next(new Error("No file uploaded!"));
    return;
  }

  res.json({ 
    fileUrl: req.file.path,
    duration: req.file.duration
   });
});

router.get("/", (req, res, next) => {
  Sound.find()
    .then((soundsFromDB) => res.status(200).json(soundsFromDB))
    .catch((err) => next(err));
});

// POST '/sounds' => for saving a new sound in the database
router.post("/", (req, res, next) => {
  console.log('body: ', req.body);

  Sound.create(req.body)
    .then((createdSound) => {
      // console.log('Created new sound: ', createdSound);
      res.status(200).json(createdSound);
    })
    .catch((err) => next(err));
});

module.exports = router;

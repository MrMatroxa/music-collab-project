const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    allowed_formats: ["mp3", "wav"],
    folder: "sound-gallery",
    resource_type: "video",
    eager: [{ audio_codec: "none" }],
  },
});

// Export both the multer middleware and the cloudinary object
module.exports = multer({ storage });
module.exports.v2 = cloudinary; // Add this line


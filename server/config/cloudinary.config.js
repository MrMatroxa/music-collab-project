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

// (async function() {

//     // Configuration
//     // cloudinary.config({
//     //     cloud_name: 'dk3wyjx4z',
//     //     api_key: '594111186926496',
//     //     api_secret: '<your_api_secret>' // Click 'View API Keys' above to copy your API secret
//     // });

//     // Upload an image
//      const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });

//     console.log(uploadResult);

//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });

//     console.log(optimizeUrl);

//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });

//     console.log(autoCropUrl);
// })();

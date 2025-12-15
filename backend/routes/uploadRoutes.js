// routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const { protect, admin } = require("../middleware/authMiddleware");
require("dotenv").config();

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage (no disk write)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.toLowerCase().split(".").pop());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed!"));
  },
});

// Helper function to upload from buffer to Cloudinary
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "tech-mart/products",
        resource_type: "image",
        // Optional: Add transformation for consistent sizing
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto:good" },
        ],
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// POST /api/upload - Admin only image upload
router.post("/", protect, admin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const result = await streamUpload(req.file.buffer);

    res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Better handling for multer validation error
    if (error.message && error.message.includes("Only image files")) {
      return res.status(400).json({ message: error.message });
    }

    // Handle file size limit error
    if (error.message && error.message.includes("File too large")) {
      return res.status(400).json({ message: "File size exceeds 5MB limit" });
    }

    // General server error
    res.status(500).json({ 
      message: "Image upload failed", 
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
});

module.exports = router;
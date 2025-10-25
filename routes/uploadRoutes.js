import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Image from "../models/Image.js";

const router = express.Router();

// ✅ ตั้งค่า Multer แบบ memoryStorage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ อัปโหลดรูปขึ้น Cloudinary
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // ใช้วิธี upload_stream + buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "image_upload_system_uploads" },
      async (error, result) => {
        if (error) return res.status(500).json({ error: error.message });

        const image = new Image({
          url: result.secure_url,
          public_id: result.public_id,
        });
        await image.save();

        res.status(200).json({
          message: "✅ Image uploaded successfully",
          data: image,
        });
      }
    );

    // ✅ ใช้ buffer ของไฟล์แทน stream.pipe()
    uploadStream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ดึงรูปทั้งหมด
router.get("/images", async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ลบรูปตาม ID
router.delete("/images/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    await cloudinary.uploader.destroy(image.public_id);
    await image.deleteOne();

    res.json({ message: "🗑️ Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

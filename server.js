import dotenv from "dotenv";
dotenv.config(); // ✅ โหลดค่า .env ก่อน

import express from "express";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import uploadRoutes from "./routes/uploadRoutes.js";
import cors from "cors";
    

const app = express();
app.use(cors());
app.use(express.json());

// ✅ เชื่อม MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ ตั้งค่า Cloudinary โดยอ่านจาก .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

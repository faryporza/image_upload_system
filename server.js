import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ เชื่อมต่อ MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ ตั้งค่า Cloudinary
cloudinary.config({
  secure: true,
});

// ✅ ใช้ routes
app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

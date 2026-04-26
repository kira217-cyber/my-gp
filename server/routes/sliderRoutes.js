import express from "express";
import fs from "fs";
import path from "path";
import Slider from "../models/Slider.js";
import upload from "../config/multer.js";

const router = express.Router();

const removeFile = (fileUrl = "") => {
  try {
    if (!fileUrl || fileUrl.startsWith("http")) return;

    const cleanPath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    const fullPath = path.join(process.cwd(), cleanPath);

    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (error) {
    console.error("Remove slider image error:", error.message);
  }
};

const buildImagePath = (req, file) => {
  if (!file) return "";
  return `/uploads/${file.filename}`;
};

// ✅ CLIENT: active sliders only
router.get("/", async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: sliders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load sliders",
      error: error.message,
    });
  }
});

// ✅ ADMIN: all sliders
router.get("/admin/all", async (req, res) => {
  try {
    const sliders = await Slider.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: sliders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load admin sliders",
      error: error.message,
    });
  }
});

// ✅ ADMIN: create slider
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title = "", order = 0, isActive = true } = req.body || {};

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Slider image is required",
      });
    }

    const slider = await Slider.create({
      title,
      order: Number(order || 0),
      isActive: String(isActive) === "true" || isActive === true,
      image: buildImagePath(req, req.file),
    });

    return res.status(201).json({
      success: true,
      message: "Slider created successfully",
      data: slider,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create slider",
      error: error.message,
    });
  }
});

// ✅ ADMIN: update slider
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, order, isActive, removeOldImage } = req.body || {};

    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    if (title !== undefined) slider.title = title;
    if (order !== undefined) slider.order = Number(order || 0);
    if (isActive !== undefined) {
      slider.isActive = String(isActive) === "true" || isActive === true;
    }

    if (req.file) {
      removeFile(slider.image);
      slider.image = buildImagePath(req, req.file);
    } else if (String(removeOldImage) === "true") {
      removeFile(slider.image);
      slider.image = "";
    }

    if (!slider.image) {
      return res.status(400).json({
        success: false,
        message: "Slider image is required",
      });
    }

    await slider.save();

    return res.json({
      success: true,
      message: "Slider updated successfully",
      data: slider,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update slider",
      error: error.message,
    });
  }
});

// ✅ ADMIN: delete slider
router.delete("/:id", async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    removeFile(slider.image);
    await slider.deleteOne();

    return res.json({
      success: true,
      message: "Slider deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete slider",
      error: error.message,
    });
  }
});

export default router;
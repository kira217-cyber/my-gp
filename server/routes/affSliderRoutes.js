import express from "express";
import fs from "fs";
import path from "path";
import AffSlider from "../models/AffSlider.js";
import upload from "../config/multer.js";

const router = express.Router();

const removeFile = (fileUrl = "") => {
  try {
    if (!fileUrl || fileUrl.startsWith("http")) return;

    const cleanPath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    const fullPath = path.join(process.cwd(), cleanPath);

    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (error) {
    console.error("Remove aff slider image error:", error.message);
  }
};

const buildImagePath = (file) => {
  if (!file) return "";
  return `/uploads/${file.filename}`;
};

// CLIENT: active affiliate sliders
router.get("/", async (req, res) => {
  try {
    const sliders = await AffSlider.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({ success: true, data: sliders });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load affiliate sliders",
      error: error.message,
    });
  }
});

// ADMIN: all affiliate sliders
router.get("/admin/all", async (req, res) => {
  try {
    const sliders = await AffSlider.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({ success: true, data: sliders });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load admin affiliate sliders",
      error: error.message,
    });
  }
});

// ADMIN: create
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title = "", order = 0, isActive = true } = req.body || {};

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Slider image is required",
      });
    }

    const slider = await AffSlider.create({
      title,
      order: Number(order || 0),
      isActive: String(isActive) === "true" || isActive === true,
      image: buildImagePath(req.file),
    });

    return res.status(201).json({
      success: true,
      message: "Affiliate slider created successfully",
      data: slider,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create affiliate slider",
      error: error.message,
    });
  }
});

// ADMIN: update
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, order, isActive } = req.body || {};

    const slider = await AffSlider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Affiliate slider not found",
      });
    }

    if (title !== undefined) slider.title = title;
    if (order !== undefined) slider.order = Number(order || 0);
    if (isActive !== undefined) {
      slider.isActive = String(isActive) === "true" || isActive === true;
    }

    if (req.file) {
      removeFile(slider.image);
      slider.image = buildImagePath(req.file);
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
      message: "Affiliate slider updated successfully",
      data: slider,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update affiliate slider",
      error: error.message,
    });
  }
});

// ADMIN: delete
router.delete("/:id", async (req, res) => {
  try {
    const slider = await AffSlider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Affiliate slider not found",
      });
    }

    removeFile(slider.image);
    await slider.deleteOne();

    return res.json({
      success: true,
      message: "Affiliate slider deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete affiliate slider",
      error: error.message,
    });
  }
});

export default router;
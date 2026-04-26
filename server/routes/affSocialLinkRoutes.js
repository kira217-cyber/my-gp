import express from "express";
import fs from "fs";
import path from "path";
import AffSocialLink from "../models/AffSocialLink.js";
import upload from "../config/multer.js";

const router = express.Router();

const removeFile = (fileUrl = "") => {
  try {
    if (!fileUrl || fileUrl.startsWith("http")) return;

    const cleanPath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    const fullPath = path.join(process.cwd(), cleanPath);

    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (error) {
    console.error("Remove affiliate social icon error:", error.message);
  }
};

const filePath = (file) => (file ? `/uploads/${file.filename}` : "");

// AFFILIATE CLIENT GET ACTIVE
router.get("/", async (req, res) => {
  try {
    const items = await AffSocialLink.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: { items },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load affiliate social links",
      error: error.message,
    });
  }
});

// ADMIN GET ALL
router.get("/admin", async (req, res) => {
  try {
    const items = await AffSocialLink.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: { items },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load admin affiliate social links",
      error: error.message,
    });
  }
});

// ADMIN CREATE
router.post("/admin", upload.single("icon"), async (req, res) => {
  try {
    const { url = "", order = 0, isActive = true } = req.body || {};

    if (!url.trim()) {
      return res.status(400).json({
        success: false,
        message: "Affiliate social link URL is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Affiliate social icon is required",
      });
    }

    const item = await AffSocialLink.create({
      url: url.trim(),
      order: Number(order || 0),
      isActive: String(isActive) === "true" || isActive === true,
      iconUrl: filePath(req.file),
    });

    return res.status(201).json({
      success: true,
      message: "Affiliate social link added successfully",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add affiliate social link",
      error: error.message,
    });
  }
});

// ADMIN UPDATE
router.put("/admin/:id", upload.single("icon"), async (req, res) => {
  try {
    const { url = "", order = 0, isActive = true } = req.body || {};

    const item = await AffSocialLink.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Affiliate social link not found",
      });
    }

    if (!url.trim()) {
      return res.status(400).json({
        success: false,
        message: "Affiliate social link URL is required",
      });
    }

    item.url = url.trim();
    item.order = Number(order || 0);
    item.isActive = String(isActive) === "true" || isActive === true;

    if (req.file) {
      removeFile(item.iconUrl);
      item.iconUrl = filePath(req.file);
    }

    if (!item.iconUrl) {
      return res.status(400).json({
        success: false,
        message: "Affiliate social icon is required",
      });
    }

    await item.save();

    return res.json({
      success: true,
      message: "Affiliate social link updated successfully",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update affiliate social link",
      error: error.message,
    });
  }
});

// ADMIN DELETE
router.delete("/admin/:id", async (req, res) => {
  try {
    const item = await AffSocialLink.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Affiliate social link not found",
      });
    }

    removeFile(item.iconUrl);
    await item.deleteOne();

    return res.json({
      success: true,
      message: "Affiliate social link deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete affiliate social link",
      error: error.message,
    });
  }
});

export default router;
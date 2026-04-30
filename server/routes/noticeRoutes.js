import express from "express";
import mongoose from "mongoose";
import Notice from "../models/Notice.js";

const router = express.Router();

const normalizeText = (text = {}) => ({
  bn: String(text?.bn || "").trim(),
  en: String(text?.en || "").trim(),
});

const validateNotice = ({ text }) => {
  if (!text?.bn?.trim() || !text?.en?.trim()) {
    return "Notice text BN and EN are required";
  }

  return null;
};

/**
 * PUBLIC / CLIENT
 * GET /api/notices
 */
router.get("/notices", async (_req, res) => {
  try {
    const notices = await Notice.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: notices,
    });
  } catch (err) {
    console.error("public notices list error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// GET /api/notices (CLIENT)
router.get("/", async (req, res) => {
  try {
    const list = await Notice.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN LIST
 * GET /api/admin/notices
 */
router.get("/admin/notices", async (_req, res) => {
  try {
    const notices = await Notice.find({}).sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      data: notices,
    });
  } catch (err) {
    console.error("admin notices list error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN CREATE
 * POST /api/admin/notices
 */
router.post("/admin/notices", async (req, res) => {
  try {
    const text = normalizeText(req.body?.text || {});
    const linkUrl = String(req.body?.linkUrl || "").trim();
    const isActive = req.body?.isActive !== false;

    const error = validateNotice({ text });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const doc = await Notice.create({
      text,
      linkUrl,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: "Notice created successfully",
      data: doc,
    });
  } catch (err) {
    console.error("create notice error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN UPDATE
 * PUT /api/admin/notices/:id
 */
router.put("/admin/notices/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice id",
      });
    }

    const doc = await Notice.findById(id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    const text = normalizeText(req.body?.text || {});
    const linkUrl = String(req.body?.linkUrl || "").trim();
    const isActive = req.body?.isActive !== false;

    const error = validateNotice({ text });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    doc.text = text;
    doc.linkUrl = linkUrl;
    doc.isActive = isActive;

    await doc.save();

    return res.json({
      success: true,
      message: "Notice updated successfully",
      data: doc,
    });
  } catch (err) {
    console.error("update notice error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN TOGGLE
 * PATCH /api/admin/notices/:id/toggle
 */
router.patch("/admin/notices/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice id",
      });
    }

    const doc = await Notice.findById(id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    doc.isActive = !doc.isActive;
    await doc.save();

    return res.json({
      success: true,
      message: `Notice ${doc.isActive ? "activated" : "deactivated"} successfully`,
      data: doc,
    });
  } catch (err) {
    console.error("toggle notice error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN DELETE
 * DELETE /api/admin/notices/:id
 */
router.delete("/admin/notices/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice id",
      });
    }

    const doc = await Notice.findByIdAndDelete(id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    return res.json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (err) {
    console.error("delete notice error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
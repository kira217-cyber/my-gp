import express from "express";
import mongoose from "mongoose";
import RegisterBonusSetting from "../models/RegisterBonusSetting.js";

const router = express.Router();

const n = (v) => {
  const num = Number(v || 0);
  return Number.isFinite(num) ? num : 0;
};

const normalizeTitle = (title = {}) => ({
  bn: String(title?.bn || "").trim(),
  en: String(title?.en || "").trim(),
});

const validatePayload = ({ amount, turnoverMultiplier }) => {
  const bonusAmount = Number(amount);
  const multiplier = Number(turnoverMultiplier);

  if (!Number.isFinite(bonusAmount) || bonusAmount < 0) {
    return "Bonus amount must be valid";
  }

  if (!Number.isFinite(multiplier) || multiplier < 0) {
    return "Turnover multiplier must be valid";
  }

  return null;
};

/**
 * PUBLIC / CLIENT
 * GET /api/register-bonus/active
 */
router.get("/register-bonus/active", async (_req, res) => {
  try {
    const bonus = await RegisterBonusSetting.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: bonus || null,
    });
  } catch (err) {
    console.error("active register bonus error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN LIST
 * GET /api/admin/register-bonuses
 */
router.get("/admin/register-bonuses", async (_req, res) => {
  try {
    const bonuses = await RegisterBonusSetting.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: bonuses,
    });
  } catch (err) {
    console.error("register bonuses list error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN CREATE
 * POST /api/admin/register-bonuses
 *
 * body:
 * {
 *   title: { bn, en },
 *   amount,
 *   turnoverMultiplier,
 *   isActive
 * }
 */
router.post("/admin/register-bonuses", async (req, res) => {
  try {
    const title = normalizeTitle(req.body?.title || {});
    const amount = n(req.body?.amount);
    const turnoverMultiplier = n(req.body?.turnoverMultiplier);
    const isActive = req.body?.isActive !== false;

    const error = validatePayload({ amount, turnoverMultiplier });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const doc = await RegisterBonusSetting.create({
      title,
      amount,
      turnoverMultiplier,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: "Register bonus created successfully",
      data: doc,
    });
  } catch (err) {
    console.error("create register bonus error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN UPDATE
 * PUT /api/admin/register-bonuses/:id
 */
router.put("/admin/register-bonuses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bonus id",
      });
    }

    const doc = await RegisterBonusSetting.findById(id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Register bonus not found",
      });
    }

    const title = normalizeTitle(req.body?.title || {});
    const amount = n(req.body?.amount);
    const turnoverMultiplier = n(req.body?.turnoverMultiplier);
    const isActive = req.body?.isActive !== false;

    const error = validatePayload({ amount, turnoverMultiplier });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    doc.title = title;
    doc.amount = amount;
    doc.turnoverMultiplier = turnoverMultiplier;
    doc.isActive = isActive;

    await doc.save();

    return res.json({
      success: true,
      message: "Register bonus updated successfully",
      data: doc,
    });
  } catch (err) {
    console.error("update register bonus error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN TOGGLE
 * PATCH /api/admin/register-bonuses/:id/toggle
 */
router.patch("/admin/register-bonuses/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bonus id",
      });
    }

    const doc = await RegisterBonusSetting.findById(id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Register bonus not found",
      });
    }

    doc.isActive = !doc.isActive;
    await doc.save();

    return res.json({
      success: true,
      message: `Register bonus ${doc.isActive ? "activated" : "deactivated"} successfully`,
      data: doc,
    });
  } catch (err) {
    console.error("toggle register bonus error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN DELETE
 * DELETE /api/admin/register-bonuses/:id
 */
router.delete("/admin/register-bonuses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bonus id",
      });
    }

    const doc = await RegisterBonusSetting.findByIdAndDelete(id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Register bonus not found",
      });
    }

    return res.json({
      success: true,
      message: "Register bonus deleted successfully",
    });
  } catch (err) {
    console.error("delete register bonus error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
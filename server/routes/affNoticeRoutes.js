import express from "express";
import AffNotice from "../models/AffNotice.js";

const router = express.Router();

const getOrCreate = async () => {
  let doc = await AffNotice.findOne();
  if (!doc) doc = await AffNotice.create({});
  return doc;
};

// Affiliate client get
router.get("/", async (req, res) => {
  try {
    const data = await AffNotice.findOne({ isActive: true }).lean();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load affiliate notice",
      error: error.message,
    });
  }
});

// Admin get
router.get("/admin", async (req, res) => {
  try {
    const data = await AffNotice.findOne().lean();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load affiliate notice",
      error: error.message,
    });
  }
});

// Admin save/update
router.post("/admin", async (req, res) => {
  try {
    const {
      text_bn = "",
      text_en = "",
      primaryColor = "#2f79c9",
      secondaryColor = "#f07a2a",
      speed = 16,
      isActive = true,
    } = req.body || {};

    const doc = await getOrCreate();

    doc.text = {
      bn: text_bn,
      en: text_en,
    };

    doc.primaryColor = primaryColor || "#2f79c9";
    doc.secondaryColor = secondaryColor || "#f07a2a";
    doc.speed = Number(speed || 16);
    doc.isActive = String(isActive) === "true" || isActive === true;

    await doc.save();

    return res.json({
      success: true,
      message: "Affiliate notice saved successfully",
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save affiliate notice",
      error: error.message,
    });
  }
});

export default router;
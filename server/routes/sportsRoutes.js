import express from "express";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Sports from "../models/Sports.js";
import upload from "../config/multer.js";

const router = express.Router();

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  const normalized = filePath.replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const formatSport = (req, doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    ...obj,
    iconImageUrl: obj.iconImage ? buildFileUrl(req, obj.iconImage) : "",
  };
};

const deleteLocalFile = (filePath = "") => {
  if (!filePath) return;
  if (/^https?:\/\//i.test(filePath)) return;

  const fullPath = path.resolve(filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

const cleanText = (v) => String(v || "").trim();

// CLIENT ACTIVE SPORTS
router.get("/", async (req, res) => {
  try {
    const sports = await Sports.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Sports fetched successfully",
      data: sports.map((item) => formatSport(req, item)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sports",
      error: error.message,
    });
  }
});

// ADMIN ALL SPORTS
router.get("/admin/all", async (req, res) => {
  try {
    const sports = await Sports.find().sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Sports fetched successfully",
      data: sports.map((item) => formatSport(req, item)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sports",
      error: error.message,
    });
  }
});

// CREATE SPORT
router.post("/", upload.single("iconImage"), async (req, res) => {
  try {
    const nameBn = cleanText(req.body?.name_bn);
    const nameEn = cleanText(req.body?.name_en);
    const gameId = cleanText(req.body?.gameId);
    const isActive = String(req.body?.isActive) !== "false";
    const order = Number(req.body?.order || 0);

    if (!nameBn || !nameEn || !gameId) {
      if (req.file) deleteLocalFile(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Bangla name, English name and gameId are required",
      });
    }

    const sport = await Sports.create({
      name: {
        bn: nameBn,
        en: nameEn,
      },
      iconImage: req.file ? req.file.path.replace(/\\/g, "/") : "",
      gameId,
      isActive,
      order: Number.isFinite(order) ? order : 0,
    });

    return res.status(201).json({
      success: true,
      message: "Sport created successfully",
      data: formatSport(req, sport),
    });
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);

    return res.status(500).json({
      success: false,
      message: "Failed to create sport",
      error: error.message,
    });
  }
});

// UPDATE SPORT
router.put("/:id", upload.single("iconImage"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      if (req.file) deleteLocalFile(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Invalid sport id",
      });
    }

    const sport = await Sports.findById(id);

    if (!sport) {
      if (req.file) deleteLocalFile(req.file.path);

      return res.status(404).json({
        success: false,
        message: "Sport not found",
      });
    }

    const nameBn = cleanText(req.body?.name_bn);
    const nameEn = cleanText(req.body?.name_en);
    const gameId = cleanText(req.body?.gameId);
    const isActive = String(req.body?.isActive) !== "false";
    const order = Number(req.body?.order || 0);
    const removeOldImage = String(req.body?.removeOldImage) === "true";

    if (!nameBn || !nameEn || !gameId) {
      if (req.file) deleteLocalFile(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Bangla name, English name and gameId are required",
      });
    }

    const oldImagePath = sport.iconImage;

    sport.name = {
      bn: nameBn,
      en: nameEn,
    };
    sport.gameId = gameId;
    sport.isActive = isActive;
    sport.order = Number.isFinite(order) ? order : 0;

    if (req.file) {
      sport.iconImage = req.file.path.replace(/\\/g, "/");
    } else if (removeOldImage) {
      sport.iconImage = "";
    }

    await sport.save();

    if (req.file && oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    if (removeOldImage && !req.file && oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    return res.status(200).json({
      success: true,
      message: "Sport updated successfully",
      data: formatSport(req, sport),
    });
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);

    return res.status(500).json({
      success: false,
      message: "Failed to update sport",
      error: error.message,
    });
  }
});

// DELETE SPORT
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sport id",
      });
    }

    const sport = await Sports.findById(id);

    if (!sport) {
      return res.status(404).json({
        success: false,
        message: "Sport not found",
      });
    }

    const oldImagePath = sport.iconImage;

    await Sports.findByIdAndDelete(id);

    if (oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    return res.status(200).json({
      success: true,
      message: "Sport deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete sport",
      error: error.message,
    });
  }
});

export default router;
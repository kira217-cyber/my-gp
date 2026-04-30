import express from "express";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Game from "../models/Games.js";
import GameCategory from "../models/GameCategories.js";
import GameProvider from "../models/GameProviders.js";
import upload from "../config/multer.js";

const router = express.Router();

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const normalized = filePath.replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const formatGame = (req, doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    ...obj,
    imageUrl: obj.image ? buildFileUrl(req, obj.image) : "",
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

const toBool = (value) => String(value) === "true";

const BOOLEAN_FIELDS = [
  "isHot",
  "isJili",
  "isPg",
  "isPoker",
  "isCrash",
  "isLiveCasino",
  "isFish",
  "isFavorites",
  "isLatest",
  "isAZ",
];

const applyBooleanFlags = (target, source = {}) => {
  BOOLEAN_FIELDS.forEach((field) => {
    if (typeof source[field] !== "undefined") {
      target[field] = toBool(source[field]);
    }
  });
};

// CREATE GAME
router.post("/", async (req, res) => {
  try {
    const { categoryId, providerDbId, gameId, status } = req.body || {};

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required",
      });
    }

    if (!providerDbId || !mongoose.Types.ObjectId.isValid(providerDbId)) {
      return res.status(400).json({
        success: false,
        message: "Valid providerDbId is required",
      });
    }

    if (!gameId || !String(gameId).trim()) {
      return res.status(400).json({
        success: false,
        message: "gameId is required",
      });
    }

    const categoryExists = await GameCategory.findById(categoryId);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const providerExists = await GameProvider.findById(providerDbId);

    if (!providerExists) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const alreadyExists = await Game.findOne({
      providerDbId,
      gameId: String(gameId).trim(),
    });

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "This game already exists under the selected provider",
      });
    }

    const payload = {
      categoryId,
      providerDbId,
      gameId: String(gameId).trim(),
      image: "",
      isHot: false,
      isJili: false,
      isPg: false,
      isPoker: false,
      isCrash: false,
      isLiveCasino: false,
      isFish: false,
      isFavorites: false,
      isLatest: false,
      isAZ: false,
      status: status === "inactive" ? "inactive" : "active",
    };

    applyBooleanFlags(payload, req.body);

    const game = await Game.create(payload);

    const populated = await Game.findById(game._id)
      .populate("categoryId", "categoryName categoryTitle status")
      .populate(
        "providerDbId",
        "providerId providerIcon providerImage status categoryId isHome",
      );

    return res.status(201).json({
      success: true,
      message: "Game added successfully",
      data: formatGame(req, populated),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add game",
      error: error.message,
    });
  }
});

// GET GAMES
router.get("/", async (req, res) => {
  try {
    const { providerDbId, categoryId, status } = req.query;

    const filter = {};

    if (providerDbId) {
      if (!mongoose.Types.ObjectId.isValid(providerDbId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid providerDbId",
        });
      }

      filter.providerDbId = providerDbId;
    }

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId",
        });
      }

      filter.categoryId = categoryId;
    }

    if (status && ["active", "inactive"].includes(status)) {
      filter.status = status;
    }

    BOOLEAN_FIELDS.forEach((field) => {
      const value = req.query[field];

      if (value === "true" || value === "false") {
        filter[field] = value === "true";
      }
    });

    const games = await Game.find(filter)
      .populate("categoryId", "categoryName categoryTitle status")
      .populate(
        "providerDbId",
        "providerId providerIcon providerImage status categoryId isHome",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: games.length,
      data: games.map((item) => formatGame(req, item)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch games",
      error: error.message,
    });
  }
});

// GET SINGLE GAME
router.get("/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate("categoryId", "categoryName categoryTitle status")
      .populate(
        "providerDbId",
        "providerId providerIcon providerImage status categoryId isHome",
      );

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatGame(req, game),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch game",
      error: error.message,
    });
  }
});

// UPDATE GAME
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      if (req.file) deleteLocalFile(req.file.path);

      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const { status, removeOldImage } = req.body || {};
    const oldImagePath = game.image;

    if (req.file) {
      game.image = req.file.path.replace(/\\/g, "/");
    } else if (removeOldImage === "true") {
      game.image = "";
    }

    if (status && ["active", "inactive"].includes(status)) {
      game.status = status;
    }

    applyBooleanFlags(game, req.body);

    await game.save();

    if (req.file && oldImagePath && oldImagePath !== game.image) {
      deleteLocalFile(oldImagePath);
    }

    if (removeOldImage === "true" && !req.file && oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    const populated = await Game.findById(game._id)
      .populate("categoryId", "categoryName categoryTitle status")
      .populate(
        "providerDbId",
        "providerId providerIcon providerImage status categoryId isHome",
      );

    return res.status(200).json({
      success: true,
      message: "Game updated successfully",
      data: formatGame(req, populated),
    });
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);

    return res.status(500).json({
      success: false,
      message: "Failed to update game",
      error: error.message,
    });
  }
});

// DELETE GAME
router.delete("/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const oldImagePath = game.image;

    await Game.findByIdAndDelete(req.params.id);

    if (oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    return res.status(200).json({
      success: true,
      message: "Game deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete game",
      error: error.message,
    });
  }
});

export default router;

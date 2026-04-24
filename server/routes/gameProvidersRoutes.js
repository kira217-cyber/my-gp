import express from "express";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import GameProvider from "../models/GameProviders.js";
import GameCategory from "../models/GameCategories.js";
import upload from "../config/multer.js";

const router = express.Router();

const uploadProviderFiles = upload.fields([
  { name: "providerIcon", maxCount: 1 },
  { name: "providerImage", maxCount: 1 },
]);

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  const normalized = filePath.replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const getFilePath = (req, fieldName) => {
  return req.files?.[fieldName]?.[0]?.path?.replace(/\\/g, "/") || "";
};

const deleteLocalFile = (filePath = "") => {
  if (!filePath) return;
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

const deleteUploadedFiles = (req) => {
  deleteLocalFile(getFilePath(req, "providerIcon"));
  deleteLocalFile(getFilePath(req, "providerImage"));
};

const toBool = (value) => value === true || value === "true" || value === "1";

const formatProvider = (req, doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    ...obj,
    providerIconUrl: obj.providerIcon
      ? buildFileUrl(req, obj.providerIcon)
      : "",
    providerImageUrl: obj.providerImage
      ? buildFileUrl(req, obj.providerImage)
      : "",
  };
};

// CREATE
router.post("/", uploadProviderFiles, async (req, res) => {
  try {
    const { categoryId, providerId, status, isHome } = req.body;

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      deleteUploadedFiles(req);
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required",
      });
    }

    if (!providerId?.trim()) {
      deleteUploadedFiles(req);
      return res.status(400).json({
        success: false,
        message: "providerId is required",
      });
    }

    const categoryExists = await GameCategory.findById(categoryId);
    if (!categoryExists) {
      deleteUploadedFiles(req);
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const existing = await GameProvider.findOne({
      categoryId,
      providerId: providerId.trim(),
    });

    if (existing) {
      deleteUploadedFiles(req);
      return res.status(409).json({
        success: false,
        message: "This provider already exists in the selected category",
      });
    }

    const provider = await GameProvider.create({
      categoryId,
      providerId: providerId.trim(),
      providerIcon: getFilePath(req, "providerIcon"),
      providerImage: getFilePath(req, "providerImage"),
      isHome: toBool(isHome),
      status: status === "inactive" ? "inactive" : "active",
    });

    const populated = await GameProvider.findById(provider._id).populate(
      "categoryId",
      "categoryName categoryTitle status",
    );

    return res.status(201).json({
      success: true,
      message: "Provider added successfully",
      data: formatProvider(req, populated),
    });
  } catch (error) {
    deleteUploadedFiles(req);

    return res.status(500).json({
      success: false,
      message: "Failed to add provider",
      error: error.message,
    });
  }
});

// GET PROVIDERS
router.get("/", async (req, res) => {
  try {
    const { categoryId, status, isHome } = req.query;

    const filter = {};

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

    if (isHome === "true" || isHome === "false") {
      filter.isHome = isHome === "true";
    }

    const providers = await GameProvider.find(filter)
      .populate("categoryId", "categoryName categoryTitle status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: providers.length,
      data: providers.map((item) => formatProvider(req, item)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch providers",
      error: error.message,
    });
  }
});

// SINGLE
router.get("/:id", async (req, res) => {
  try {
    const provider = await GameProvider.findById(req.params.id).populate(
      "categoryId",
      "categoryName categoryTitle status",
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatProvider(req, provider),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch provider",
      error: error.message,
    });
  }
});

// UPDATE
router.put("/:id", uploadProviderFiles, async (req, res) => {
  try {
    const provider = await GameProvider.findById(req.params.id);

    if (!provider) {
      deleteUploadedFiles(req);
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const {
      categoryId,
      providerId,
      status,
      isHome,
      removeOldIcon,
      removeOldImage,
    } = req.body;

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      deleteUploadedFiles(req);
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required",
      });
    }

    if (!providerId?.trim()) {
      deleteUploadedFiles(req);
      return res.status(400).json({
        success: false,
        message: "providerId is required",
      });
    }

    const categoryExists = await GameCategory.findById(categoryId);
    if (!categoryExists) {
      deleteUploadedFiles(req);
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const duplicate = await GameProvider.findOne({
      _id: { $ne: provider._id },
      categoryId,
      providerId: providerId.trim(),
    });

    if (duplicate) {
      deleteUploadedFiles(req);
      return res.status(409).json({
        success: false,
        message: "This provider already exists in the selected category",
      });
    }

    const oldIconPath = provider.providerIcon;
    const oldImagePath = provider.providerImage;

    const newIconPath = getFilePath(req, "providerIcon");
    const newImagePath = getFilePath(req, "providerImage");

    provider.categoryId = categoryId;
    provider.providerId = providerId.trim();
    provider.status = status === "inactive" ? "inactive" : "active";
    provider.isHome = toBool(isHome);

    if (newIconPath) {
      provider.providerIcon = newIconPath;
    } else if (removeOldIcon === "true") {
      provider.providerIcon = "";
    }

    if (newImagePath) {
      provider.providerImage = newImagePath;
    } else if (removeOldImage === "true") {
      provider.providerImage = "";
    }

    await provider.save();

    if (newIconPath && oldIconPath) deleteLocalFile(oldIconPath);
    if (newImagePath && oldImagePath) deleteLocalFile(oldImagePath);

    if (removeOldIcon === "true" && !newIconPath && oldIconPath) {
      deleteLocalFile(oldIconPath);
    }

    if (removeOldImage === "true" && !newImagePath && oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    const populated = await GameProvider.findById(provider._id).populate(
      "categoryId",
      "categoryName categoryTitle status",
    );

    return res.status(200).json({
      success: true,
      message: "Provider updated successfully",
      data: formatProvider(req, populated),
    });
  } catch (error) {
    deleteUploadedFiles(req);

    return res.status(500).json({
      success: false,
      message: "Failed to update provider",
      error: error.message,
    });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const provider = await GameProvider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const oldIconPath = provider.providerIcon;
    const oldImagePath = provider.providerImage;

    await GameProvider.findByIdAndDelete(req.params.id);

    deleteLocalFile(oldIconPath);
    deleteLocalFile(oldImagePath);

    return res.status(200).json({
      success: true,
      message: "Provider deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete provider",
      error: error.message,
    });
  }
});

export default router;

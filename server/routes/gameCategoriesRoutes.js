import express from "express";
import fs from "fs";
import path from "path";
import GameCategory from "../models/GameCategories.js";
import upload from "../config/multer.js";

const router = express.Router();

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  const normalized = filePath.replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const formatCategory = (req, doc) => {
  const obj = doc.toObject();

  return {
    ...obj,
    iconImageUrl: obj.iconImage ? buildFileUrl(req, obj.iconImage) : "",
  };
};

const deleteLocalFile = (filePath = "") => {
  if (!filePath) return;

  const fullPath = path.resolve(filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// CREATE
router.post("/", upload.single("iconImage"), async (req, res) => {
  try {
    const {
      categoryNameBn,
      categoryNameEn,
      categoryTitleBn,
      categoryTitleEn,
      order,
      status,
    } = req.body;

    if (!categoryNameBn?.trim() || !categoryNameEn?.trim()) {
      if (req.file) deleteLocalFile(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Category name Bangla and English required",
      });
    }

    if (!categoryTitleBn?.trim() || !categoryTitleEn?.trim()) {
      if (req.file) deleteLocalFile(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Category title Bangla and English required",
      });
    }

    const category = await GameCategory.create({
      categoryName: {
        bn: categoryNameBn.trim(),
        en: categoryNameEn.trim(),
      },
      categoryTitle: {
        bn: categoryTitleBn.trim(),
        en: categoryTitleEn.trim(),
      },
      iconImage: req.file ? req.file.path.replace(/\\/g, "/") : "",
      order: Number(order) || 0,
      status: status === "inactive" ? "inactive" : "active",
    });

    return res.status(201).json({
      success: true,
      message: "Game category created successfully",
      data: formatCategory(req, category),
    });
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
});

// ADMIN ALL
router.get("/admin/all", async (req, res) => {
  try {
    const categories = await GameCategory.find().sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: categories.map((item) => formatCategory(req, item)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
});

// CLIENT ACTIVE
router.get("/", async (req, res) => {
  try {
    const categories = await GameCategory.find({ status: "active" }).sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: categories.map((item) => formatCategory(req, item)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active categories",
      error: error.message,
    });
  }
});

// SINGLE
router.get("/:id", async (req, res) => {
  try {
    const category = await GameCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatCategory(req, category),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
});

// UPDATE
router.put("/:id", upload.single("iconImage"), async (req, res) => {
  try {
    const category = await GameCategory.findById(req.params.id);

    if (!category) {
      if (req.file) deleteLocalFile(req.file.path);

      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const {
      categoryNameBn,
      categoryNameEn,
      categoryTitleBn,
      categoryTitleEn,
      order,
      status,
      removeOldImage,
    } = req.body;

    if (!categoryNameBn?.trim() || !categoryNameEn?.trim()) {
      if (req.file) deleteLocalFile(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Category name Bangla and English required",
      });
    }

    if (!categoryTitleBn?.trim() || !categoryTitleEn?.trim()) {
      if (req.file) deleteLocalFile(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Category title Bangla and English required",
      });
    }

    const oldImagePath = category.iconImage;

    category.categoryName = {
      bn: categoryNameBn.trim(),
      en: categoryNameEn.trim(),
    };

    category.categoryTitle = {
      bn: categoryTitleBn.trim(),
      en: categoryTitleEn.trim(),
    };

    category.order = Number(order) || 0;
    category.status = status === "inactive" ? "inactive" : "active";

    if (req.file) {
      category.iconImage = req.file.path.replace(/\\/g, "/");
    } else if (removeOldImage === "true") {
      category.iconImage = "";
    }

    await category.save();

    if (req.file && oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    if (removeOldImage === "true" && !req.file && oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    return res.status(200).json({
      success: true,
      message: "Game category updated successfully",
      data: formatCategory(req, category),
    });
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const category = await GameCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const oldImagePath = category.iconImage;

    await GameCategory.findByIdAndDelete(req.params.id);

    if (oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    return res.status(200).json({
      success: true,
      message: "Game category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
});

export default router;
import express from "express";
import fs from "fs";
import path from "path";
import SiteIdentity from "../models/SiteIdentity.js";
import upload from "../config/multer.js";

const router = express.Router();

const uploadFields = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "favicon", maxCount: 1 },
]);

const removeFile = (fileUrl = "") => {
  try {
    if (!fileUrl || fileUrl.startsWith("http")) return;

    const cleanPath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    const fullPath = path.join(process.cwd(), cleanPath);

    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (error) {
    console.error("Remove file error:", error.message);
  }
};

const filePath = (file) => {
  if (!file) return "";
  return `/uploads/${file.filename}`;
};

const getOrCreateIdentity = async () => {
  let data = await SiteIdentity.findOne();
  if (!data) data = await SiteIdentity.create({});
  return data;
};

// CLIENT GET
router.get("/", async (req, res) => {
  try {
    const data = await SiteIdentity.findOne().lean();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load site identity",
      error: error.message,
    });
  }
});

// ADMIN GET
router.get("/admin", async (req, res) => {
  try {
    const data = await SiteIdentity.findOne().lean();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load site identity",
      error: error.message,
    });
  }
});

// ADMIN CREATE / UPDATE
router.post("/admin", uploadFields, async (req, res) => {
  try {
    const { title_bn = "", title_en = "" } = req.body || {};

    const data = await getOrCreateIdentity();

    data.title = {
      bn: title_bn,
      en: title_en,
    };

    const logoFile = req.files?.logo?.[0];
    const faviconFile = req.files?.favicon?.[0];

    if (logoFile) {
      removeFile(data.logo);
      data.logo = filePath(logoFile);
    }

    if (faviconFile) {
      removeFile(data.favicon);
      data.favicon = filePath(faviconFile);
    }

    await data.save();

    return res.json({
      success: true,
      message: "Site identity saved successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save site identity",
      error: error.message,
    });
  }
});

// ADMIN DELETE LOGO
router.delete("/admin/logo", async (req, res) => {
  try {
    const data = await getOrCreateIdentity();

    removeFile(data.logo);
    data.logo = "";
    await data.save();

    return res.json({
      success: true,
      message: "Logo deleted successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete logo",
      error: error.message,
    });
  }
});

// ADMIN DELETE FAVICON
router.delete("/admin/favicon", async (req, res) => {
  try {
    const data = await getOrCreateIdentity();

    removeFile(data.favicon);
    data.favicon = "";
    await data.save();

    return res.json({
      success: true,
      message: "Favicon deleted successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete favicon",
      error: error.message,
    });
  }
});

export default router;
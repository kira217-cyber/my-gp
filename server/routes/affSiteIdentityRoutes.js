import express from "express";
import fs from "fs";
import path from "path";
import AffSiteIdentity from "../models/AffSiteIdentity.js";
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
    console.error("Remove aff identity file error:", error.message);
  }
};

const filePath = (file) => (file ? `/uploads/${file.filename}` : "");

const getOrCreate = async () => {
  let data = await AffSiteIdentity.findOne();
  if (!data) data = await AffSiteIdentity.create({});
  return data;
};

// affiliate client get
router.get("/", async (req, res) => {
  try {
    const data = await AffSiteIdentity.findOne().lean();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load affiliate site identity",
      error: error.message,
    });
  }
});

// admin get
router.get("/admin", async (req, res) => {
  try {
    const data = await AffSiteIdentity.findOne().lean();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load affiliate site identity",
      error: error.message,
    });
  }
});

// admin save
router.post("/admin", uploadFields, async (req, res) => {
  try {
    const { title_bn = "", title_en = "" } = req.body || {};
    const data = await getOrCreate();

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
      message: "Affiliate site identity saved successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save affiliate site identity",
      error: error.message,
    });
  }
});

// delete logo
router.delete("/admin/logo", async (req, res) => {
  try {
    const data = await getOrCreate();
    removeFile(data.logo);
    data.logo = "";
    await data.save();

    return res.json({
      success: true,
      message: "Affiliate logo deleted successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete affiliate logo",
      error: error.message,
    });
  }
});

// delete favicon
router.delete("/admin/favicon", async (req, res) => {
  try {
    const data = await getOrCreate();
    removeFile(data.favicon);
    data.favicon = "";
    await data.save();

    return res.json({
      success: true,
      message: "Affiliate favicon deleted successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete affiliate favicon",
      error: error.message,
    });
  }
});

export default router;
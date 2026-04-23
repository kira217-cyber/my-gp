import express from "express";
import DepositMethod from "../models/DepositMethod.js";
import DepositBonusTurnover from "../models/DepositBonusTurnover.js";

const router = express.Router();

const safeParseJSON = (value, fallback) => {
  try {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeTextBi = (value = {}) => ({
  bn: typeof value?.bn === "string" ? value.bn.trim() : "",
  en: typeof value?.en === "string" ? value.en.trim() : "",
});

// GET all
router.get("/", async (req, res) => {
  try {
    const data = await DepositBonusTurnover.find()
      .populate("depositMethod")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Deposit bonus configs fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET deposit bonus configs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch deposit bonus configs",
      error: error.message,
    });
  }
});

// GET by method id
router.get("/method/:methodId", async (req, res) => {
  try {
    const method = await DepositMethod.findById(req.params.methodId);
    if (!method) {
      return res.status(404).json({
        success: false,
        message: "Deposit method not found",
      });
    }

    const data = await DepositBonusTurnover.findOne({
      depositMethod: req.params.methodId,
    }).populate("depositMethod");

    res.status(200).json({
      success: true,
      message: "Deposit bonus config fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET single deposit bonus config error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch deposit bonus config",
      error: error.message,
    });
  }
});

// UPSERT
router.post("/", async (req, res) => {
  try {
    const body = req.body || {};

    const depositMethod = String(body.depositMethod || "").trim();
    if (!depositMethod) {
      return res.status(400).json({
        success: false,
        message: "depositMethod is required",
      });
    }

    const methodExists = await DepositMethod.findById(depositMethod);
    if (!methodExists) {
      return res.status(404).json({
        success: false,
        message: "Selected deposit method not found",
      });
    }

    const channels = safeParseJSON(body.channels, []).map((item, index) => ({
      id: String(item?.id || `channel-${Date.now()}-${index}`).trim(),
      name: normalizeTextBi(item?.name || {}),
      tagText: String(item?.tagText || "+0%").trim(),
      bonusTitle: normalizeTextBi(item?.bonusTitle || {}),
      bonusPercent: Number(item?.bonusPercent || 0),
      isActive: item?.isActive !== false,
    }));

    const promotions = safeParseJSON(body.promotions, []).map((item, index) => ({
      id: String(item?.id || `promotion-${Date.now()}-${index}`)
        .trim()
        .toLowerCase(),
      name: normalizeTextBi(item?.name || {}),
      bonusType: item?.bonusType === "percent" ? "percent" : "fixed",
      bonusValue: Number(item?.bonusValue || 0),
      turnoverMultiplier: Number(item?.turnoverMultiplier || 1),
      isActive: item?.isActive !== false,
      sort: Number(item?.sort ?? index),
    }));

    const turnoverMultiplier = Number(body.turnoverMultiplier || 1);

    const data = await DepositBonusTurnover.findOneAndUpdate(
      { depositMethod },
      {
        depositMethod,
        turnoverMultiplier,
        channels,
        promotions,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).populate("depositMethod");

    res.status(200).json({
      success: true,
      message: "Deposit bonus & turnover config saved successfully",
      data,
    });
  } catch (error) {
    console.error("UPSERT deposit bonus config error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save deposit bonus config",
      error: error.message,
    });
  }
});

export default router;
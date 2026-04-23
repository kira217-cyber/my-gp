import express from "express";
import DepositMethod from "../models/DepositMethod.js";
import DepositFieldConfig from "../models/DepositFieldConfig.js";
import DepositBonusTurnover from "../models/DepositBonusTurnover.js";

const router = express.Router();

router.get("/deposit-methods/public", async (req, res) => {
  try {
    const methods = await DepositMethod.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    const methodIds = methods.map((m) => m._id);

    const [fieldConfigs, bonusConfigs] = await Promise.all([
      DepositFieldConfig.find({
        depositMethod: { $in: methodIds },
      }).lean(),
      DepositBonusTurnover.find({
        depositMethod: { $in: methodIds },
      }).lean(),
    ]);

    const fieldMap = new Map(
      fieldConfigs.map((item) => [String(item.depositMethod), item]),
    );

    const bonusMap = new Map(
      bonusConfigs.map((item) => [String(item.depositMethod), item]),
    );

    const data = methods.map((method) => {
      const fieldConfig = fieldMap.get(String(method._id));
      const bonusConfig = bonusMap.get(String(method._id));

      return {
        ...method,
        instructions: fieldConfig?.instructions || { bn: "", en: "" },
        inputs: Array.isArray(fieldConfig?.inputs) ? fieldConfig.inputs : [],
        turnoverMultiplier: Number(bonusConfig?.turnoverMultiplier ?? 1) || 1,
        channels: Array.isArray(bonusConfig?.channels) ? bonusConfig.channels : [],
        promotions: Array.isArray(bonusConfig?.promotions)
          ? bonusConfig.promotions
          : [],
      };
    });

    res.json({
      success: true,
      message: "Deposit methods fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET public deposit methods error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch public deposit methods",
      error: error.message,
    });
  }
});

export default router;
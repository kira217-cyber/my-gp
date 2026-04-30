import express from "express";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import GameHistory from "../models/GameHistory.js";

const router = express.Router();

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const applyTurnoverProgress = async ({ userId, amount }) => {
  if (amount <= 0) return;

  const turnovers = await TurnOver.find({
    user: userId,
    status: "running",
  }).sort({ createdAt: 1 });

  let remaining = amount;

  for (const turnover of turnovers) {
    if (remaining <= 0) break;

    const left = Math.max(0, num(turnover.required) - num(turnover.progress));
    if (left <= 0) continue;

    const add = Math.min(left, remaining);
    const completed = num(turnover.progress) + add >= num(turnover.required);

    await TurnOver.updateOne(
      { _id: turnover._id },
      {
        $inc: { progress: add },
        ...(completed
          ? {
              $set: {
                status: "completed",
                completedAt: new Date(),
              },
            }
          : {}),
      },
    );

    remaining -= add;
  }
};

const applyGameCommissions = async ({ user, betType, amountValue }) => {
  if (!user?.referredBy) return;

  const affiliator = await User.findById(user.referredBy).select(
    "_id role isActive referredBy gameLossCommission gameWinCommission",
  );

  if (
    !affiliator ||
    affiliator.role !== "aff-user" ||
    affiliator.isActive !== true
  ) {
    return;
  }

  if (betType === "BET" && num(affiliator.gameLossCommission) > 0) {
    const affLossCommission =
      (amountValue * num(affiliator.gameLossCommission)) / 100;

    await User.updateOne(
      { _id: affiliator._id },
      {
        $inc: {
          gameLossCommissionBalance: affLossCommission,
        },
      },
    );
  }

  if (betType === "SETTLE" && num(affiliator.gameWinCommission) > 0) {
    const affWinCommission =
      (amountValue * num(affiliator.gameWinCommission)) / 100;

    await User.updateOne(
      { _id: affiliator._id },
      {
        $inc: {
          gameWinCommissionBalance: affWinCommission,
        },
      },
    );
  }

  if (!affiliator.referredBy) return;

  const superAffiliator = await User.findOne({
    _id: affiliator.referredBy,
    role: "super-aff-user",
    isActive: true,
  }).select("_id role isActive gameLossCommission gameWinCommission");

  if (!superAffiliator) return;

  if (betType === "BET" && num(superAffiliator.gameLossCommission) > 0) {
    const superLossCommission =
      (amountValue * num(superAffiliator.gameLossCommission)) / 100;

    await User.updateOne(
      { _id: superAffiliator._id },
      {
        $inc: {
          gameLossCommissionBalance: superLossCommission,
        },
      },
    );
  }

  if (betType === "SETTLE" && num(superAffiliator.gameWinCommission) > 0) {
    const superWinCommission =
      (amountValue * num(superAffiliator.gameWinCommission)) / 100;

    await User.updateOne(
      { _id: superAffiliator._id },
      {
        $inc: {
          gameWinCommissionBalance: superWinCommission,
        },
      },
    );
  }
};

router.post("/", async (req, res) => {
  try {
    const {
      username,
      provider_code,
      game_code,
      bet_type,
      amount,
      transaction_id,
      round_id,
      verification_key,
      times,
      bet_details,
    } = req.body || {};

    if (
      !username ||
      !provider_code ||
      game_code === undefined ||
      game_code === null ||
      !bet_type ||
      amount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const cleanUserId = String(username).trim();
    const providerCode = String(provider_code).trim().toUpperCase();
    const gameCode = String(game_code).trim();
    const betType = String(bet_type).trim().toUpperCase();
    const amountValue = Number.parseFloat(amount);

    if (!["BET", "SETTLE", "CANCEL"].includes(betType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bet_type",
      });
    }

    if (!Number.isFinite(amountValue) || amountValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    let balanceChange = 0;
    let status = "bet";
    let winAmount = 0;

    if (betType === "BET") {
      balanceChange = -amountValue;
      status = "bet";
    }

    if (betType === "SETTLE") {
      balanceChange = amountValue;
      status = amountValue > 0 ? "won" : "lost";
      winAmount = amountValue;
    }

    if (betType === "CANCEL") {
      balanceChange = amountValue;
      status = "cancelled";
    }

    const user = await User.findOne({ userId: cleanUserId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "User inactive",
      });
    }

    const cleanVerificationKey = verification_key
      ? String(verification_key).trim()
      : null;

    if (cleanVerificationKey) {
      const exists = await GameHistory.findOne({
        verification_key: cleanVerificationKey,
      });

      if (exists) {
        return res.json({
          success: true,
          message: "Already processed",
          data: {
            verification_key: cleanVerificationKey,
            current_balance: num(user.balance),
          },
        });
      }
    }

    const currentBalance = num(user.balance);
    const newBalance = currentBalance + balanceChange;

    if (betType === "BET" && newBalance < 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    const history = await GameHistory.create({
      user: user._id,
      userId: user.userId,
      provider_code: providerCode,
      game_code: gameCode,
      bet_type: betType,
      amount: amountValue,
      win_amount: winAmount,
      balance_after: newBalance,
      transaction_id: transaction_id ? String(transaction_id).trim() : null,
      round_id: round_id ? String(round_id).trim() : null,
      verification_key: cleanVerificationKey,
      times: times ? String(times).trim() : null,
      status,
      bet_details:
        bet_details && typeof bet_details === "object" ? bet_details : {},
    });

    await User.updateOne(
      { _id: user._id },
      {
        $inc: {
          balance: balanceChange,
        },
      },
    );

    if (betType === "BET" && amountValue > 0) {
      await applyTurnoverProgress({
        userId: user._id,
        amount: amountValue,
      });
    }

    if ((betType === "BET" || betType === "SETTLE") && amountValue > 0) {
      await applyGameCommissions({
        user,
        betType,
        amountValue,
      });
    }

    return res.json({
      success: true,
      message: "Processed successfully",
      data: {
        historyId: history._id,
        user: user._id,
        userId: user.userId,
        bet_type: betType,
        amount: amountValue,
        balanceChange,
        balance_after: newBalance,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.json({
        success: true,
        message: "Already processed",
      });
    }

    console.error("GAME CALLBACK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

export default router;

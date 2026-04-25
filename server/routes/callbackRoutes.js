import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import GameHistory from "../models/GameHistory.js";

const router = express.Router();

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const applyTurnoverProgress = async ({ session, userId, amount }) => {
  if (amount <= 0) return;

  const turnovers = await TurnOver.find({
    user: userId,
    status: "running",
  })
    .sort({ createdAt: 1 })
    .session(session);

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
    ).session(session);

    remaining -= add;
  }
};

router.post("/", async (req, res) => {
  const session = await mongoose.startSession();

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
      !game_code ||
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

    let result = null;

    await session.withTransaction(async () => {
      const user = await User.findOne({ userId: cleanUserId }).session(session);

      if (!user) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
      }

      if (user.isActive === false) {
        throw Object.assign(new Error("User inactive"), { statusCode: 403 });
      }

      const cleanVerificationKey = verification_key
        ? String(verification_key).trim()
        : null;

      if (cleanVerificationKey) {
        const exists = await GameHistory.findOne({
          verification_key: cleanVerificationKey,
        }).session(session);

        if (exists) {
          throw Object.assign(new Error("DUPLICATE_CALLBACK"), {
            statusCode: 200,
            duplicate: true,
            currentBalance: num(user.balance),
          });
        }
      }

      const currentBalance = num(user.balance);
      const newBalance = currentBalance + balanceChange;

      if (betType === "BET" && newBalance < 0) {
        throw Object.assign(new Error("Insufficient balance"), {
          statusCode: 400,
        });
      }

      const [history] = await GameHistory.create(
        [
          {
            user: user._id,
            userId: user.userId,
            provider_code: providerCode,
            game_code: gameCode,
            bet_type: betType,
            amount: amountValue,
            win_amount: winAmount,
            balance_after: newBalance,
            transaction_id: transaction_id
              ? String(transaction_id).trim()
              : null,
            round_id: round_id ? String(round_id).trim() : null,
            verification_key: cleanVerificationKey,
            times: times ? String(times).trim() : null,
            status,
            bet_details:
              bet_details && typeof bet_details === "object" ? bet_details : {},
          },
        ],
        { session },
      );

      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: balanceChange } },
      ).session(session);

      if (betType === "BET" && amountValue > 0) {
        await applyTurnoverProgress({
          session,
          userId: user._id,
          amount: amountValue,
        });
      }

      // affiliate commission
      if (user.referredBy) {
        const affiliator = await User.findById(user.referredBy).session(
          session,
        );

        if (
          affiliator &&
          affiliator.role === "aff-user" &&
          affiliator.isActive === true
        ) {
          if (betType === "BET" && num(affiliator.gameLossCommission) > 0) {
            const commission =
              (amountValue * num(affiliator.gameLossCommission)) / 100;

            await User.updateOne(
              { _id: affiliator._id },
              { $inc: { gameLossCommissionBalance: commission } },
            ).session(session);
          }

          if (betType === "SETTLE" && num(affiliator.gameWinCommission) > 0) {
            const commission =
              (amountValue * num(affiliator.gameWinCommission)) / 100;

            await User.updateOne(
              { _id: affiliator._id },
              { $inc: { gameWinCommissionBalance: commission } },
            ).session(session);
          }
        }
      }

      result = {
        historyId: history._id,
        user: user._id,
        userId: user.userId,
        bet_type: betType,
        amount: amountValue,
        balanceChange,
        balance_after: newBalance,
      };
    });

    return res.json({
      success: true,
      message: "Processed successfully",
      data: result,
    });
  } catch (error) {
    if (error?.duplicate) {
      return res.json({
        success: true,
        message: "Already processed",
        data: {
          verification_key: req.body?.verification_key || null,
          current_balance: error.currentBalance,
        },
      });
    }

    if (error?.code === 11000) {
      return res.json({
        success: true,
        message: "Already processed",
      });
    }

    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error?.message || "Server error",
    });
  } finally {
    session.endSession();
  }
});

export default router;

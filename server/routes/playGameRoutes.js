import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import qs from "qs";
import User from "../models/User.js";
import Game from "../models/Games.js";
import GameProvider from "../models/GameProviders.js";

const router = express.Router();

/**
 * auth middleware
 * expects: Authorization: Bearer <token>
 */
const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id =
      decoded?.id ||
      decoded?._id ||
      decoded?.userId ||
      decoded?.user?._id ||
      decoded?.user?.id;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.user = { id };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const isObjectIdLike = (val) => /^[0-9a-fA-F]{24}$/.test(String(val || ""));

/**
 * Oracle single game details
 */
const fetchOracleGameDetails = async ({ oracleGameId, apiKey }) => {
  const res = await axios.get(
    `https://api.oraclegames.live/api/games/${encodeURIComponent(
      String(oracleGameId),
    )}`,
    {
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
      timeout: 30000,
    },
  );

  const responseRoot = res.data || {};
  const data = Array.isArray(responseRoot?.data)
    ? responseRoot.data[0] || {}
    : responseRoot?.data || {};

  return {
    // ✅ 0 holeo "0" hisebe thakbe
    game_code: String(data?.game_code ?? "").trim(),

    game_type:
      String(data?.provider?.gameType ?? "")
        .trim()
        .toUpperCase() ||
      String(data?.game_type ?? "")
        .trim()
        .toUpperCase(),

    provider_game_type: String(data?.provider?.gameType ?? "")
      .trim()
      .toUpperCase(),

    raw: data,
  };
};

/**
 * POST /api/play-game/playgame
 * body: { gameID }
 *
 * gameID can be:
 * - Game._id
 * - Game.gameId
 */
router.post("/playgame", requireAuth, async (req, res) => {
  try {
    const { gameID } = req.body || {};

    if (!gameID) {
      return res.status(400).json({
        success: false,
        message: "gameID is required",
      });
    }

    const user = await User.findById(req.user?.id).select(
      "userId balance isActive currency",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive !== true) {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    // ✅ balance 0 holeo game launch hobe
    let balance = Number(user.balance ?? 0);
    if (!Number.isFinite(balance) || balance < 0) {
      balance = 0;
    }

    const ORACLE_API_KEY = process.env.DSTGAME_TOKEN;

    if (!ORACLE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "DSTGAME_TOKEN missing in .env",
      });
    }

    let gameDoc = null;

    if (isObjectIdLike(gameID)) {
      gameDoc = await Game.findById(gameID);
    }

    if (!gameDoc) {
      gameDoc = await Game.findOne({ gameId: String(gameID).trim() });
    }

    if (!gameDoc) {
      return res.status(404).json({
        success: false,
        message:
          "Game not found in DB (gameID must be Game._id or Game.gameId)",
      });
    }

    if (gameDoc.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This game is inactive",
      });
    }

    const providerDoc = await GameProvider.findById(
      gameDoc.providerDbId,
    ).select("providerId status");

    if (!providerDoc) {
      return res.status(404).json({
        success: false,
        message: "Provider not found for this game",
      });
    }

    if (providerDoc.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Provider is inactive",
      });
    }

    const provider_code = String(providerDoc.providerId ?? "")
      .trim()
      .toUpperCase();

    if (!provider_code) {
      return res.status(400).json({
        success: false,
        message: "Provider code missing",
      });
    }

    const oracleGameId = String(gameDoc.gameId ?? "").trim();

    if (!oracleGameId) {
      return res.status(400).json({
        success: false,
        message: "Oracle game id missing in DB",
      });
    }

    const oracleGameDetails = await fetchOracleGameDetails({
      oracleGameId,
      apiKey: ORACLE_API_KEY,
    });

    const game_code = String(oracleGameDetails.game_code ?? "").trim();
    const game_type = String(oracleGameDetails.game_type ?? "")
      .trim()
      .toUpperCase();

    // ✅ "0" allowed, only empty string block korbo
    if (game_code === "") {
      return res.status(400).json({
        success: false,
        message: "game_code not found from Oracle API",
      });
    }

    if (!game_type) {
      return res.status(400).json({
        success: false,
        message: "game_type not found from Oracle API",
      });
    }

    const payload = {
      username: String(user.userId ?? "").trim(),
      money: Math.max(0, Math.floor(Number(balance) || 0)),
      currency: String(user.currency ?? "BDT").trim() || "BDT",

      // ✅ 0 -> "0"
      game_code: String(game_code ?? "").trim(),

      provider_code: String(provider_code ?? "").trim(),
      game_type: String(game_type ?? "").trim(),
    };

    if (!payload.username) {
      return res.status(400).json({
        success: false,
        message: "User userId is missing",
      });
    }

    console.log("Launching game payload:", payload);

    /**
     * =========================
     * ✅ LIVE MODE
     * =========================
     */

    // live
    // const LAUNCH_URL = "https://crazybet99.com/getgameurl/v2";

    // const response = await axios.post(LAUNCH_URL, qs.stringify(payload), {
    //   headers: {
    //     "Content-Type": "application/x-www-form-urlencoded",

    //     // live korar somoi original dstgame key boshabe
    //     "x-dstgame-key": process.env.DSTGAME_KEY,

    //     // test korte chaile direct key boshao
    //     // "x-dstgame-key": "412afc3901061cd4389224fd1643a709",
    //   },
    //   timeout: 30000,
    // });

    // live er jonno
    // const responseData = response.data;

    /**
     * =========================
     * ✅ TEST MODE
     * =========================
     * live mode off korte hole uporer LIVE MODE er axios block comment kore,
     * nicher TEST MODE block uncomment korba.
     */

    // test er jonno
    const LAUNCH_URL = "https://api.oraclegames.live/api/admin/games/launch";

    // test er jonno JSON launch:
    const response = await fetch(LAUNCH_URL, {
      method: "POST",
      headers: {
        "x-dstgame-key": process.env.DSTGAME_KEY || ORACLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();

    let gameUrl = "";

    if (typeof responseData === "string") {
      gameUrl = responseData;
    } else {
      gameUrl =
        responseData?.url ||
        responseData?.data?.url ||
        responseData?.gameUrl ||
        responseData?.game_url ||
        responseData?.launchUrl ||
        responseData?.data?.launchUrl ||
        "";
    }

    if (!gameUrl || typeof gameUrl !== "string") {
      return res.status(502).json({
        success: false,
        message: "No game URL received from launch API",
        error: responseData,
      });
    }

    return res.json({
      success: true,
      gameUrl,
      used: {
        game_db_id: String(gameDoc._id),
        oracle_game_id: oracleGameId,
        game_code,
        provider_code,
        game_type,
      },
    });
  } catch (error) {
    console.error("PlayGame API Error:", error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Failed to launch game",
      error: error.response?.data || error.message,
    });
  }
});

export default router;
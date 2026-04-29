import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import qs from "qs";
import User from "../models/User.js";
import Game from "../models/Games.js";
import Sports from "../models/Sports.js";

const router = express.Router();

const ORACLE_BY_IDS_API = "https://api.oraclegames.live/api/games/by-ids";

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

const fetchOracleGameDetailsByIds = async ({ oracleGameId, apiKey }) => {
  const res = await axios.post(
    ORACLE_BY_IDS_API,
    {
      ids: [String(oracleGameId)],
    },
    {
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
      timeout: 30000,
    },
  );

  const data = res?.data?.data?.[0] || {};

  return {
    game_code: String(data?.game_code ?? "").trim(),

    provider_code: String(
      data?.provider?.provider_code ||
        data?.provider?.providerCode ||
        data?.provider_code ||
        data?.providerCode ||
        "",
    )
      .trim()
      .toUpperCase(),

    game_type: String(
      data?.game_type || data?.provider?.gameType || data?.gameType || "",
    )
      .trim()
      .toUpperCase(),

    raw: data,
  };
};

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
    let sportsDoc = null;
    let sourceType = "";

    if (isObjectIdLike(gameID)) {
      gameDoc = await Game.findById(gameID);

      if (!gameDoc) {
        sportsDoc = await Sports.findById(gameID);
      }
    }

    if (!gameDoc && !sportsDoc) {
      gameDoc = await Game.findOne({ gameId: String(gameID).trim() });

      if (!gameDoc) {
        sportsDoc = await Sports.findOne({ gameId: String(gameID).trim() });
      }
    }

    if (gameDoc) sourceType = "game";
    if (sportsDoc) sourceType = "sports";

    if (!gameDoc && !sportsDoc) {
      return res.status(404).json({
        success: false,
        message:
          "Game not found in DB. gameID must be Game._id, Game.gameId, Sports._id or Sports.gameId",
      });
    }

    let oracleGameId = "";

    if (sourceType === "game") {
      if (gameDoc.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "This game is inactive",
        });
      }

      oracleGameId = String(gameDoc.gameId ?? "").trim();
    }

    if (sourceType === "sports") {
      if (sportsDoc.isActive !== true) {
        return res.status(403).json({
          success: false,
          message: "This sports game is inactive",
        });
      }

      oracleGameId = String(sportsDoc.gameId ?? "").trim();
    }

    if (!oracleGameId) {
      return res.status(400).json({
        success: false,
        message: "Oracle game id missing in DB",
      });
    }

    const oracleGameDetails = await fetchOracleGameDetailsByIds({
      oracleGameId,
      apiKey: ORACLE_API_KEY,
    });

    const game_code = String(oracleGameDetails.game_code ?? "").trim();

    const provider_code = String(oracleGameDetails.provider_code ?? "")
      .trim()
      .toUpperCase();

    const game_type = String(oracleGameDetails.game_type ?? "")
      .trim()
      .toUpperCase();

    if (game_code === "") {
      return res.status(400).json({
        success: false,
        message: "game_code not found from Oracle by-ids API",
      });
    }

    if (!provider_code) {
      return res.status(400).json({
        success: false,
        message: "provider_code not found from Oracle by-ids API",
      });
    }

    if (!game_type) {
      return res.status(400).json({
        success: false,
        message: "game_type not found from Oracle by-ids API",
      });
    }

    const payload = {
      username: String(user.userId ?? "").trim(),
      money: Math.max(0, Math.floor(Number(balance) || 0)),
      currency: String(user.currency ?? "BDT").trim() || "BDT",

      // ✅ by-ids API theke asbe
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
    //     "x-dstgame-key": "402060036e22229f5c0a1bfd33a1ef00",

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
        sourceType,
        game_db_id: gameDoc ? String(gameDoc._id) : "",
        sports_db_id: sportsDoc ? String(sportsDoc._id) : "",
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

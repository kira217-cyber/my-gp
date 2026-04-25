import mongoose from "mongoose";

const gameHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    provider_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    game_code: {
      type: String,
      required: true,
      trim: true,
    },

    bet_type: {
      type: String,
      enum: ["BET", "SETTLE", "CANCEL"],
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    win_amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    balance_after: {
      type: Number,
      default: 0,
    },

    transaction_id: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },

    round_id: {
      type: String,
      trim: true,
      default: null,
    },

    verification_key: {
      type: String,
      trim: true,
      default: null,
      unique: true,
      sparse: true,
    },

    times: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: ["bet", "settled", "won", "lost", "cancelled"],
      required: true,
      index: true,
    },

    bet_details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

gameHistorySchema.index({ user: 1, createdAt: -1 });
gameHistorySchema.index({ userId: 1, createdAt: -1 });
gameHistorySchema.index({ provider_code: 1, game_code: 1 });
gameHistorySchema.index({ status: 1, createdAt: -1 });

const GameHistory = mongoose.model("GameHistory", gameHistorySchema);

export default GameHistory;
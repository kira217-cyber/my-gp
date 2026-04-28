import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameCategory",
      required: true,
      index: true,
    },

    providerDbId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameProvider",
      required: true,
      index: true,
    },

    gameId: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    isHot: {
      type: Boolean,
      default: false,
      index: true,
    },

    isJili: {
      type: Boolean,
      default: false,
      index: true,
    },

    isPg: {
      type: Boolean,
      default: false,
      index: true,
    },

    isPoker: {
      type: Boolean,
      default: false,
      index: true,
    },

    isCrash: {
      type: Boolean,
      default: false,
      index: true,
    },

    isLiveCasino: {
      type: Boolean,
      default: false,
      index: true,
    },

    isFish: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

GameSchema.index({ providerDbId: 1, gameId: 1 }, { unique: true });

export default mongoose.model("Game", GameSchema);

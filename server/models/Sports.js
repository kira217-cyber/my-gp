import mongoose from "mongoose";

const SportsSchema = new mongoose.Schema(
  {
    name: {
      bn: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },

    iconImage: {
      type: String,
      default: "",
      trim: true,
    },

    gameId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Sports ||
  mongoose.model("Sports", SportsSchema);
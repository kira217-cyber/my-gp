import mongoose from "mongoose";

const TurnOverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sourceType: {
      type: String,
      enum: [
        "deposit",
        "auto-deposit",
        "auto-personal-deposit",
        "register-bonus",
      ],
      required: true,
      index: true,
    },

    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    required: {
      type: Number,
      required: true,
      min: 0,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["running", "completed"],
      default: "running",
      index: true,
    },

    creditedAmount: {
      type: Number,
      default: 0,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

TurnOverSchema.index({ user: 1, sourceType: 1, sourceId: 1 }, { unique: true });

TurnOverSchema.index({ user: 1, status: 1 });
TurnOverSchema.index({ createdAt: -1 });

export default mongoose.model("TurnOver", TurnOverSchema);

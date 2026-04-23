import mongoose from "mongoose";

const EWalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    methodId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    walletType: {
      type: String,
      enum: ["personal", "agent", "merchant"],
      default: "personal",
      trim: true,
    },

    walletNumber: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      default: "",
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

EWalletSchema.index(
  { user: 1, methodId: 1, walletNumber: 1 },
  { unique: true },
);

const EWallet =
  mongoose.models.EWallet || mongoose.model("EWallet", EWalletSchema);

export default EWallet;
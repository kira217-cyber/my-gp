import mongoose from "mongoose";

const RegisterBonusSettingSchema = new mongoose.Schema(
  {
    title: {
      bn: {
        type: String,
        default: "",
        trim: true,
      },
      en: {
        type: String,
        default: "",
        trim: true,
      },
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    turnoverMultiplier: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

RegisterBonusSettingSchema.index({ isActive: 1, createdAt: -1 });

const RegisterBonusSetting =
  mongoose.models.RegisterBonusSetting ||
  mongoose.model("RegisterBonusSetting", RegisterBonusSettingSchema);

export default RegisterBonusSetting;
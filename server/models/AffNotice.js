import mongoose from "mongoose";

const AffNoticeSchema = new mongoose.Schema(
  {
    text: {
      bn: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },
    primaryColor: { type: String, default: "#2f79c9" },
    secondaryColor: { type: String, default: "#f07a2a" },
    speed: { type: Number, default: 16 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.AffNotice ||
  mongoose.model("AffNotice", AffNoticeSchema);
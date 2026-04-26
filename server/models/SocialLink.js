import mongoose from "mongoose";

const SocialLinkSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    iconUrl: { type: String, required: true, trim: true },
    order: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

SocialLinkSchema.index({ order: 1, createdAt: -1 });

export default mongoose.models.SocialLink ||
  mongoose.model("SocialLink", SocialLinkSchema);
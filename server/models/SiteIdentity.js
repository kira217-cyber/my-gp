import mongoose from "mongoose";

const SiteIdentitySchema = new mongoose.Schema(
  {
    title: {
      bn: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },
    logo: { type: String, default: "", trim: true },
    favicon: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

export default mongoose.models.SiteIdentity ||
  mongoose.model("SiteIdentity", SiteIdentitySchema);
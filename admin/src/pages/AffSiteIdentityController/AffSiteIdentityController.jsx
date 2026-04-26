import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaGlobe, FaImage, FaSave, FaSpinner, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const APP_URL =
  import.meta.env.VITE_APP_URL || import.meta.env.VITE_API_URL || "";

const makeUrl = (url = "") => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${APP_URL}${url}`;
};

const AffSiteIdentityController = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title_bn: "",
    title_en: "",
    logo: null,
    favicon: null,
  });

  const [existingData, setExistingData] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [faviconPreview, setFaviconPreview] = useState("");

  const fetchIdentity = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/aff-site-identity/admin");
      const data = res?.data?.data || null;

      setExistingData(data);

      setForm({
        title_bn: data?.title?.bn || "",
        title_en: data?.title?.en || "",
        logo: null,
        favicon: null,
      });

      setLogoPreview(data?.logo || "");
      setFaviconPreview(data?.favicon || "");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to load affiliate site identity",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdentity();
  }, []);

  useEffect(() => {
    if (!form.logo) return;
    const objectUrl = URL.createObjectURL(form.logo);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.logo]);

  useEffect(() => {
    if (!form.favicon) return;
    const objectUrl = URL.createObjectURL(form.favicon);
    setFaviconPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.favicon]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  const clearInputFiles = () => {
    const logoInput = document.getElementById("aff-site-logo-input");
    const faviconInput = document.getElementById("aff-site-favicon-input");

    if (logoInput) logoInput.value = "";
    if (faviconInput) faviconInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("title_bn", form.title_bn || "");
      payload.append("title_en", form.title_en || "");

      if (form.logo) payload.append("logo", form.logo);
      if (form.favicon) payload.append("favicon", form.favicon);

      const res = await api.post("/api/aff-site-identity/admin", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        res?.data?.message || "Affiliate site identity saved successfully",
      );

      clearInputFiles();
      fetchIdentity();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to save affiliate site identity",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLogo = async () => {
    const ok = window.confirm(
      "Are you sure you want to delete affiliate logo?",
    );
    if (!ok) return;

    try {
      const res = await api.delete("/api/aff-site-identity/admin/logo");
      toast.success(
        res?.data?.message || "Affiliate logo deleted successfully",
      );
      clearInputFiles();
      fetchIdentity();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to delete affiliate logo",
      );
    }
  };

  const handleDeleteFavicon = async () => {
    const ok = window.confirm(
      "Are you sure you want to delete affiliate favicon?",
    );
    if (!ok) return;

    try {
      const res = await api.delete("/api/aff-site-identity/admin/favicon");
      toast.success(
        res?.data?.message || "Affiliate favicon deleted successfully",
      );
      clearInputFiles();
      fetchIdentity();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to delete affiliate favicon",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-blue-300/20 bg-black/40 px-5 py-4">
          <FaSpinner className="animate-spin text-[#8fc2f5]" />
          <span>Loading affiliate site identity...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full text-white">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6">
          <h1 className="bg-gradient-to-r from-[#8fc2f5] via-white to-[#63a8ee] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
            Affiliate Site Identity Controller
          </h1>
          <p className="mt-1 text-sm text-blue-100/80 md:text-base">
            Manage affiliate website logo, favicon and Bangla/English title.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black shadow-2xl shadow-blue-900/20"
          >
            <div className="border-b border-blue-300/20 bg-gradient-to-r from-black/70 via-[#2f79c9]/40 to-black/70 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] text-white shadow-lg shadow-blue-700/40">
                  <FaGlobe className="text-lg" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white md:text-xl">
                    Affiliate Website Identity
                  </h2>
                  <p className="text-sm text-blue-100/80">
                    Upload affiliate logo, favicon and titles.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-100">
                  Affiliate Website Title Bangla
                </label>
                <input
                  type="text"
                  name="title_bn"
                  value={form.title_bn}
                  onChange={handleChange}
                  placeholder="অ্যাফিলিয়েট ওয়েবসাইটের বাংলা টাইটেল লিখুন"
                  className="w-full rounded-2xl border border-blue-300/25 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-blue-100/35 focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-100">
                  Affiliate Website Title English
                </label>
                <input
                  type="text"
                  name="title_en"
                  value={form.title_en}
                  onChange={handleChange}
                  placeholder="Write affiliate website title in English"
                  className="w-full rounded-2xl border border-blue-300/25 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-blue-100/35 focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-100">
                    Affiliate Logo Upload
                  </label>

                  <label
                    htmlFor="aff-site-logo-input"
                    className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300/30 bg-black/40 px-4 py-4 text-center transition hover:border-[#63a8ee] hover:bg-[#2f79c9]/10"
                  >
                    {logoPreview ? (
                      <img
                        src={makeUrl(logoPreview)}
                        alt="Affiliate Logo Preview"
                        className="h-28 w-full object-contain"
                      />
                    ) : (
                      <>
                        <FaImage className="mb-3 text-3xl text-[#8fc2f5]" />
                        <p className="font-semibold text-white">
                          Click to upload affiliate logo
                        </p>
                      </>
                    )}
                  </label>

                  <input
                    id="aff-site-logo-input"
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {existingData?.logo && (
                    <button
                      type="button"
                      onClick={handleDeleteLogo}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
                    >
                      <FaTrash />
                      Delete Affiliate Logo
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-100">
                    Affiliate Favicon Upload
                  </label>

                  <label
                    htmlFor="aff-site-favicon-input"
                    className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300/30 bg-black/40 px-4 py-4 text-center transition hover:border-[#63a8ee] hover:bg-[#2f79c9]/10"
                  >
                    {faviconPreview ? (
                      <img
                        src={makeUrl(faviconPreview)}
                        alt="Affiliate Favicon Preview"
                        className="h-20 w-20 rounded-xl object-contain"
                      />
                    ) : (
                      <>
                        <FaImage className="mb-3 text-3xl text-[#8fc2f5]" />
                        <p className="font-semibold text-white">
                          Click to upload affiliate favicon
                        </p>
                      </>
                    )}
                  </label>

                  <input
                    id="aff-site-favicon-input"
                    type="file"
                    name="favicon"
                    accept="image/*,.ico"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {existingData?.favicon && (
                    <button
                      type="button"
                      onClick={handleDeleteFavicon}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
                    >
                      <FaTrash />
                      Delete Affiliate Favicon
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3 font-semibold text-white shadow-lg shadow-blue-700/30 transition hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Affiliate Site Identity
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AffSiteIdentityController;

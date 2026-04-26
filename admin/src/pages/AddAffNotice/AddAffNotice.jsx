import React, { useEffect, useState } from "react";
import { FaBullhorn, FaSave, FaSpinner, FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AddAffNotice = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    text_bn: "",
    text_en: "",
    primaryColor: "#2f79c9",
    secondaryColor: "#f07a2a",
    speed: 16,
    isActive: true,
  });

  const fetchNotice = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/aff-notice/admin");
      const data = res?.data?.data;

      if (data) {
        setForm({
          text_bn: data?.text?.bn || "",
          text_en: data?.text?.en || "",
          primaryColor: data?.primaryColor || "#2f79c9",
          secondaryColor: data?.secondaryColor || "#f07a2a",
          speed: data?.speed || 16,
          isActive: Boolean(data?.isActive),
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to load notice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.text_bn.trim() && !form.text_en.trim()) {
      toast.error("Bangla or English notice text is required");
      return;
    }

    try {
      setSaving(true);

      const res = await api.post("/api/aff-notice/admin", {
        ...form,
        speed: Number(form.speed || 16),
      });

      toast.success(res?.data?.message || "Notice saved successfully");
      fetchNotice();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save notice");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-blue-300/20 bg-black/40 px-5 py-4">
          <FaSpinner className="animate-spin text-[#8fc2f5]" />
          <span>Loading affiliate notice...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full text-white">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-[#8fc2f5] via-white to-[#63a8ee] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
              Affiliate Notice Controller
            </h1>
            <p className="mt-1 text-sm text-blue-100/80 md:text-base">
              Manage affiliate website moving notice text.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchNotice}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3 font-bold text-white shadow-lg shadow-blue-700/30 transition hover:from-[#7bb7f1] hover:to-[#3b88db]"
          >
            <FaSyncAlt />
            Refresh
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black shadow-2xl shadow-blue-900/20"
        >
          <div className="border-b border-blue-300/20 bg-gradient-to-r from-black/70 via-[#2f79c9]/40 to-black/70 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] text-white shadow-lg shadow-blue-700/40">
                <FaBullhorn />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white md:text-xl">
                  Notice Settings
                </h2>
                <p className="text-sm text-blue-100/80">
                  Set Bangla/English text, status, colors and speed.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-blue-100">
                Notice Text Bangla
              </label>
              <textarea
                name="text_bn"
                value={form.text_bn}
                onChange={handleChange}
                rows={4}
                placeholder="বাংলা নোটিশ লিখুন"
                className="w-full rounded-2xl border border-blue-300/25 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-blue-100/35 focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-blue-100">
                Notice Text English
              </label>
              <textarea
                name="text_en"
                value={form.text_en}
                onChange={handleChange}
                rows={4}
                placeholder="Write English notice"
                className="w-full rounded-2xl border border-blue-300/25 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-blue-100/35 focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-blue-100">
                  Primary Color
                </label>
                <input
                  type="color"
                  name="primaryColor"
                  value={form.primaryColor}
                  onChange={handleChange}
                  className="h-12 w-full cursor-pointer rounded-2xl border border-blue-300/25 bg-black/50 p-1"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-blue-100">
                  Secondary Color
                </label>
                <input
                  type="color"
                  name="secondaryColor"
                  value={form.secondaryColor}
                  onChange={handleChange}
                  className="h-12 w-full cursor-pointer rounded-2xl border border-blue-300/25 bg-black/50 p-1"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-blue-100">
                  Speed Seconds
                </label>
                <input
                  type="number"
                  name="speed"
                  min="5"
                  max="60"
                  value={form.speed}
                  onChange={handleChange}
                  className="h-12 w-full rounded-2xl border border-blue-300/25 bg-black/50 px-4 text-white outline-none transition focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-blue-300/20 bg-black/40 px-4 py-4">
              <div>
                <p className="font-bold text-white">Notice Status</p>
                <p className="text-sm text-blue-100/70">
                  Turn on/off affiliate notice section.
                </p>
              </div>

              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-5 w-5 cursor-pointer"
              />
            </label>

            <div
              className="overflow-hidden rounded-md px-6 py-3 shadow-lg shadow-black/20"
              style={{
                background: `linear-gradient(90deg, ${form.primaryColor}, ${form.secondaryColor})`,
              }}
            >
              <div className="whitespace-nowrap text-sm font-bold text-white sm:text-base">
                Preview: {form.text_en || form.text_bn || "Your notice text"}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3 font-semibold text-white shadow-lg shadow-blue-700/30 transition hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Affiliate Notice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAffNotice;

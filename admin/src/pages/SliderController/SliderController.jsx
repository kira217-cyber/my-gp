import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FaEdit,
  FaImage,
  FaPlus,
  FaSave,
  FaSyncAlt,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL || "";

const imgUrl = (url = "") => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
};

const inputCls =
  "w-full h-11 rounded-xl border border-blue-300/25 bg-black/50 px-4 text-sm text-white placeholder-blue-100/40 outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25 transition";

const labelCls = "text-sm font-semibold text-blue-100 mb-2 block";

const SliderController = () => {
  const queryClient = useQueryClient();

  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    order: 0,
    isActive: true,
    image: null,
    preview: "",
  });

  const { data: sliders = [], isLoading } = useQuery({
    queryKey: ["admin-sliders"],
    queryFn: async () => {
      const res = await api.get("/api/sliders/admin/all");
      return res?.data?.data || [];
    },
    staleTime: 30_000,
    retry: 1,
  });

  const isEdit = Boolean(editingId);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      order: 0,
      isActive: true,
      image: null,
      preview: "",
    });
  };

  const selectedFileName = useMemo(() => {
    return form.image?.name || "";
  }, [form.image]);

  const handleFile = (file) => {
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      image: file,
      preview: URL.createObjectURL(file),
    }));
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title || "",
      order: item.order || 0,
      isActive: Boolean(item.isActive),
      image: null,
      preview: imgUrl(item.image),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit && !form.image) {
      toast.error("Slider image is required");
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("title", form.title || "");
      fd.append("order", String(form.order || 0));
      fd.append("isActive", String(form.isActive));

      if (form.image) {
        fd.append("image", form.image);
      }

      if (isEdit) {
        await api.put(`/api/sliders/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Slider updated successfully");
      } else {
        await api.post("/api/sliders", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Slider created successfully");
      }

      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-sliders"] });
      queryClient.invalidateQueries({ queryKey: ["client-sliders"] });
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save slider");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this slider?");
    if (!ok) return;

    try {
      await api.delete(`/api/sliders/${id}`);
      toast.success("Slider deleted successfully");

      if (editingId === id) resetForm();

      queryClient.invalidateQueries({ queryKey: ["admin-sliders"] });
      queryClient.invalidateQueries({ queryKey: ["client-sliders"] });
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to delete slider");
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-sliders"] });
  };

  return (
    <div className="min-h-full text-white">
      <div className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/25 to-black shadow-2xl overflow-hidden">
        <div className="border-b border-blue-300/20 bg-gradient-to-r from-black/70 via-[#2f79c9]/40 to-black/70 px-4 sm:px-6 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] flex items-center justify-center shadow-lg shadow-blue-700/40">
                <FaImage className="text-2xl text-white" />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Slider Controller
                </h1>
                <p className="text-sm text-blue-100/80 mt-1">
                  Add, update and delete client site sliders
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3 font-bold text-white hover:from-[#7bb7f1] hover:to-[#3b88db] transition-all shadow-lg shadow-blue-700/30"
            >
              <FaSyncAlt className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-8">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black p-5 md:p-6 shadow-xl"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-white">
                {isEdit ? "Update Slider" : "Add New Slider"}
              </h2>

              {isEdit && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-500/15 px-4 py-2 text-sm font-bold text-red-100 hover:bg-red-500/25 transition"
                >
                  <FaTimes />
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div>
                <label className={labelCls}>Slider Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter slider title"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Order</label>
                <input
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, order: e.target.value }))
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={form.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isActive: e.target.value === "true",
                    }))
                  }
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="true" className="bg-black">
                    Active
                  </option>
                  <option value="false" className="bg-black">
                    Inactive
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className={labelCls}>Slider Image</label>

              <label className="cursor-pointer flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-blue-300/35 bg-black/40 p-6 hover:border-[#63a8ee] transition">
                <FaImage className="text-4xl text-[#8fc2f5]" />
                <div className="text-center">
                  <p className="font-bold text-white">
                    Click to upload slider image
                  </p>
                  <p className="text-sm text-blue-100/60 mt-1">
                    PNG, JPG, WEBP, SVG, AVIF, GIF up to 10MB
                  </p>
                  {selectedFileName && (
                    <p className="text-xs text-blue-200 mt-2">
                      {selectedFileName}
                    </p>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </label>

              {form.preview && (
                <div className="mt-5 rounded-3xl border border-blue-300/20 bg-black/40 p-3">
                  <img
                    src={form.preview}
                    alt="preview"
                    className="w-full h-[150px] md:h-[220px] object-cover rounded-2xl"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-6 py-3 font-bold text-white hover:from-[#7bb7f1] hover:to-[#3b88db] transition-all disabled:opacity-60 shadow-lg shadow-blue-700/30"
              >
                {isEdit ? <FaSave /> : <FaPlus />}
                {saving ? "Saving..." : isEdit ? "Update Slider" : "Add Slider"}
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black p-5 md:p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-5">All Sliders</h2>

            {isLoading ? (
              <div className="rounded-2xl border border-blue-300/15 bg-black/40 p-5 text-blue-100">
                Loading sliders...
              </div>
            ) : sliders.length === 0 ? (
              <div className="rounded-2xl border border-blue-300/15 bg-black/40 p-5 text-blue-100">
                No slider found
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {sliders.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-3xl border border-blue-300/20 bg-black/40 p-4 hover:border-[#63a8ee]/60 transition-all"
                  >
                    <img
                      src={imgUrl(item.image)}
                      alt={item.title || "slider"}
                      className="w-full h-[150px] md:h-[190px] object-cover rounded-2xl border border-blue-300/15"
                    />

                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-white">
                          {item.title || "Untitled Slider"}
                        </h3>
                        <p className="text-sm text-blue-100/70 mt-1">
                          Order: {item.order || 0}
                        </p>
                        <span
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            item.isActive
                              ? "bg-emerald-500/15 text-emerald-200 border border-emerald-300/20"
                              : "bg-red-500/15 text-red-200 border border-red-300/20"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="cursor-pointer w-10 h-10 rounded-xl bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 flex items-center justify-center transition"
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          className="cursor-pointer w-10 h-10 rounded-xl bg-red-500/20 text-red-100 hover:bg-red-500/30 flex items-center justify-center transition"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SliderController;

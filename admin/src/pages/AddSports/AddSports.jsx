import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaSyncAlt,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaImage,
  FaFutbol,
} from "react-icons/fa";
import { api } from "../../api/axios";

const emptyForm = {
  name_bn: "",
  name_en: "",
  gameId: "",
  order: 0,
  isActive: true,
};

const inputClass =
  "w-full rounded-2xl border border-blue-300/20 bg-black/45 px-4 py-3 text-white placeholder-blue-100/40 outline-none transition-all focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/30";

const AddSports = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);

  const [iconFile, setIconFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [removeOldImage, setRemoveOldImage] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    title: "",
  });

  const isEditMode = Boolean(editingId);

  const fetchSports = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await api.get("/api/sports/admin/all");
      setList(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load sports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSports(false);
  }, []);

  useEffect(() => {
    if (iconFile instanceof File) {
      const url = URL.createObjectURL(iconFile);
      setPreview(url);

      return () => URL.revokeObjectURL(url);
    }

    setPreview(oldImageUrl || "");
  }, [iconFile, oldImageUrl]);

  const resetForm = () => {
    setEditingId("");
    setForm(emptyForm);
    setIconFile(null);
    setPreview("");
    setOldImageUrl("");
    setRemoveOldImage(false);
  };

  const onChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setIconFile(file);
    setRemoveOldImage(false);
  };

  const removeImage = () => {
    setIconFile(null);
    setPreview("");

    if (oldImageUrl) {
      setOldImageUrl("");
      setRemoveOldImage(true);
    }
  };

  const onEdit = (row) => {
    setEditingId(row._id);

    setForm({
      name_bn: row?.name?.bn || "",
      name_en: row?.name?.en || "",
      gameId: row?.gameId || "",
      order: Number(row?.order || 0),
      isActive: row?.isActive !== false,
    });

    setIconFile(null);
    setOldImageUrl(row?.iconImageUrl || "");
    setRemoveOldImage(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validate = () => {
    if (!String(form.name_bn || "").trim()) {
      return "Bangla sport name is required";
    }

    if (!String(form.name_en || "").trim()) {
      return "English sport name is required";
    }

    if (!String(form.gameId || "").trim()) {
      return "Game ID is required";
    }

    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const err = validate();

    if (err) {
      toast.error(err);
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append("name_bn", String(form.name_bn || "").trim());
      payload.append("name_en", String(form.name_en || "").trim());
      payload.append("gameId", String(form.gameId || "").trim());
      payload.append("order", String(form.order || 0));
      payload.append("isActive", String(Boolean(form.isActive)));

      if (iconFile instanceof File) {
        payload.append("iconImage", iconFile);
      }

      if (isEditMode) {
        payload.append("removeOldImage", removeOldImage ? "true" : "false");

        const res = await api.put(`/api/sports/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(res?.data?.message || "Sport updated successfully");
      } else {
        const res = await api.post("/api/sports", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(res?.data?.message || "Sport created successfully");
      }

      resetForm();
      fetchSports(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (row) => {
    setDeleteModal({
      open: true,
      id: row._id,
      title: row?.name?.en || "Sport",
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      open: false,
      id: null,
      title: "",
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/api/sports/${deleteModal.id}`);

      toast.success(res?.data?.message || "Sport deleted successfully");

      if (editingId === deleteModal.id) {
        resetForm();
      }

      closeDeleteModal();
      fetchSports(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const totalSports = useMemo(() => list.length, [list]);

  const activeSports = useMemo(
    () => list.filter((item) => item.isActive !== false).length,
    [list],
  );

  return (
    <div className="min-h-full text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/25 to-black shadow-2xl shadow-blue-950/40">
          <div className="border-b border-blue-300/20 bg-gradient-to-r from-black/80 via-[#2f79c9]/40 to-black/80 px-5 py-5 md:px-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-700/40">
                  <FaFutbol className="text-2xl text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                    Add Sports
                  </h1>
                  <p className="mt-1 text-sm text-blue-100/80">
                    Sports name, icon, game ID, order এবং active status manage
                    করুন।
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => fetchSports(true)}
                  disabled={loading || refreshing}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-300/20 bg-black/35 px-5 py-3 font-bold text-blue-100 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3 font-black text-white shadow-lg shadow-blue-700/40 transition-all hover:from-[#7bb7f1] hover:to-[#3b88db]"
                >
                  <FaPlus />
                  New Sport
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 border-b border-blue-300/20 p-4 md:grid-cols-2 md:p-6 lg:p-8">
            <div className="rounded-3xl border border-blue-300/20 bg-black/35 p-5">
              <div className="text-sm font-bold text-blue-100/75">
                Total Sports
              </div>
              <div className="mt-2 text-3xl font-black text-white">
                {totalSports}
              </div>
            </div>

            <div className="rounded-3xl border border-blue-300/20 bg-black/35 p-5">
              <div className="text-sm font-bold text-blue-100/75">
                Active Sports
              </div>
              <div className="mt-2 text-3xl font-black text-emerald-300">
                {activeSports}
              </div>
            </div>
          </div>

          <div className="border-b border-blue-300/20 p-4 md:p-6 lg:p-8">
            <div className="mb-5 flex items-center gap-3">
              <FaFutbol className="text-lg text-[#8fc2f5]" />
              <h2 className="text-xl font-black text-white">
                {isEditMode ? "Update Sport" : "Create Sport"}
              </h2>
            </div>

            <form
              onSubmit={onSubmit}
              className="grid grid-cols-1 gap-6 xl:grid-cols-3"
            >
              <div className="space-y-5 xl:col-span-2">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Sport Name Bangla
                    </label>
                    <input
                      type="text"
                      value={form.name_bn}
                      onChange={(e) => onChange("name_bn", e.target.value)}
                      placeholder="যেমন: ফুটবল"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Sport Name English
                    </label>
                    <input
                      type="text"
                      value={form.name_en}
                      onChange={(e) => onChange("name_en", e.target.value)}
                      placeholder="e.g. Football"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Game ID
                    </label>
                    <input
                      type="text"
                      value={form.gameId}
                      onChange={(e) => onChange("gameId", e.target.value)}
                      placeholder="Enter game id"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.order}
                      onChange={(e) => onChange("order", e.target.value)}
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Status
                    </label>
                    <select
                      value={String(form.isActive)}
                      onChange={(e) =>
                        onChange("isActive", e.target.value === "true")
                      }
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option className="bg-black" value="true">
                        Active
                      </option>
                      <option className="bg-black" value="false">
                        Inactive
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-blue-100">
                    Icon Image
                  </label>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-300/25 bg-black/35 p-6 text-center transition-all hover:border-[#63a8ee] hover:bg-white/10">
                    <FaImage className="mb-3 text-4xl text-[#8fc2f5]" />
                    <span className="text-base font-bold text-white">
                      Click to upload sport icon
                    </span>
                    <span className="mt-1 text-sm text-blue-100/65">
                      PNG, JPG, JPEG, WEBP, SVG, AVIF, GIF
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                      className="hidden"
                    />
                  </label>

                  {preview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 px-5 py-2.5 font-bold text-yellow-200 transition-all hover:bg-yellow-500/20"
                    >
                      <FaTimes />
                      Remove Image
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-6 py-3 font-black text-white shadow-lg shadow-blue-700/40 transition-all hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isEditMode ? <FaSave /> : <FaPlus />}
                    {saving
                      ? isEditMode
                        ? "Updating..."
                        : "Creating..."
                      : isEditMode
                        ? "Update Sport"
                        : "Create Sport"}
                  </button>

                  {isEditMode && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-6 py-3 font-bold text-red-200 transition-all hover:bg-red-500/20"
                    >
                      <FaTimes />
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="xl:col-span-1">
                <div className="sticky top-6 rounded-3xl border border-blue-300/20 bg-black/35 p-5 shadow-xl">
                  <h3 className="mb-4 text-lg font-black text-white">
                    Live Preview
                  </h3>

                  <div className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/25 to-black p-5">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-blue-300/25 bg-black/45">
                        {preview ? (
                          <img
                            src={preview}
                            alt="preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FaFutbol className="text-4xl text-[#8fc2f5]/80" />
                        )}
                      </div>

                      <h4 className="mt-4 text-xl font-black text-white">
                        {form.name_en || "Sport Name"}
                      </h4>

                      <p className="mt-1 text-sm text-blue-100/75">
                        {form.name_bn || "স্পোর্ট নাম"}
                      </p>

                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <span className="rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-sm text-blue-100">
                          Order: {form.order || 0}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-sm ${
                            form.isActive
                              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                              : "border-red-400/30 bg-red-500/10 text-red-200"
                          }`}
                        >
                          {form.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="mt-3 break-all font-mono text-xs text-blue-100/60">
                        {form.gameId || "Game ID"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            <h2 className="mb-5 text-xl font-black text-white">All Sports</h2>

            {loading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-40 animate-pulse rounded-3xl bg-white/10"
                  />
                ))}
              </div>
            ) : list.length ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {list.map((row) => (
                  <div
                    key={row._id}
                    className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black p-5 shadow-xl shadow-blue-950/30"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-blue-300/20 bg-black/45">
                        {row.iconImageUrl ? (
                          <img
                            src={row.iconImageUrl}
                            alt={row?.name?.en || "sport"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FaFutbol className="text-3xl text-[#8fc2f5]/80" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-lg font-black text-white">
                          {row?.name?.en || "—"}
                        </div>

                        <div className="mt-1 truncate text-sm text-blue-100/75">
                          {row?.name?.bn || "—"}
                        </div>

                        <div className="mt-2 break-all text-xs text-blue-100/55">
                          Game ID: {row?.gameId || "—"}
                        </div>

                        <div className="mt-1 text-xs text-blue-100/55">
                          Order: {Number(row?.order || 0)}
                        </div>

                        <div
                          className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${
                            row?.isActive !== false
                              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                              : "border-red-400/30 bg-red-500/10 text-red-200"
                          }`}
                        >
                          {row?.isActive !== false ? "ACTIVE" : "INACTIVE"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-4 py-3 font-black text-white shadow-md shadow-blue-700/30 transition-all hover:from-[#7bb7f1] hover:to-[#3b88db]"
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(row)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 font-black text-red-200 transition-all hover:bg-red-500/20"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-blue-300/20 bg-black/30 py-12 text-center text-blue-100">
                No sports found.
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteModal.open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-red-400/30 bg-gradient-to-br from-black via-red-950/20 to-black p-6 shadow-2xl">
            <h3 className="text-2xl font-black text-white">Confirm Delete</h3>

            <p className="mt-3 text-red-100/85">
              তুমি কি নিশ্চিত{" "}
              <span className="font-bold text-white">{deleteModal.title}</span>{" "}
              sport delete করতে চাও?
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white transition-all hover:bg-red-500"
              >
                <FaTrash />
                Yes, Delete
              </button>

              <button
                type="button"
                onClick={closeDeleteModal}
                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-blue-300/20 bg-black/45 px-5 py-3 font-bold text-white transition-all hover:bg-white/10"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSports;

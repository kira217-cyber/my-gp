import React, { useEffect, useMemo, useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
  FaImage,
  FaLayerGroup,
  FaSyncAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const initialForm = {
  categoryNameBn: "",
  categoryNameEn: "",
  categoryTitleBn: "",
  categoryTitleEn: "",
  order: 0,
  status: "active",
  iconImage: null,
};

const inputClass =
  "w-full rounded-2xl border border-blue-300/20 bg-black/45 px-4 py-3 text-white placeholder-blue-100/40 outline-none transition-all focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/30";

const AddCategories = () => {
  const [formData, setFormData] = useState(initialForm);
  const [preview, setPreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [removeOldImage, setRemoveOldImage] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    title: "",
  });

  const isEdit = useMemo(() => Boolean(editId), [editId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/game-categories/admin/all");
      setCategories(res?.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch categories",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData(initialForm);
    setPreview("");
    setEditId(null);
    setOldImageUrl("");
    setRemoveOldImage(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      iconImage: file,
    }));

    setRemoveOldImage(false);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      iconImage: null,
    }));

    setPreview("");

    if (oldImageUrl) {
      setRemoveOldImage(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryNameBn.trim() || !formData.categoryNameEn.trim()) {
      toast.error("Category name Bangla and English required");
      return;
    }

    if (!formData.categoryTitleBn.trim() || !formData.categoryTitleEn.trim()) {
      toast.error("Category title Bangla and English required");
      return;
    }

    try {
      setSubmitLoading(true);

      const body = new FormData();
      body.append("categoryNameBn", formData.categoryNameBn);
      body.append("categoryNameEn", formData.categoryNameEn);
      body.append("categoryTitleBn", formData.categoryTitleBn);
      body.append("categoryTitleEn", formData.categoryTitleEn);
      body.append("order", formData.order);
      body.append("status", formData.status);

      if (formData.iconImage) {
        body.append("iconImage", formData.iconImage);
      }

      if (isEdit) {
        body.append("removeOldImage", removeOldImage ? "true" : "false");

        const res = await api.put(`/api/game-categories/${editId}`, body, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(res?.data?.message || "Category updated successfully");
      } else {
        const res = await api.post("/api/game-categories", body, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(res?.data?.message || "Category added successfully");
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save category");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);

    setFormData({
      categoryNameBn: item?.categoryName?.bn || "",
      categoryNameEn: item?.categoryName?.en || "",
      categoryTitleBn: item?.categoryTitle?.bn || "",
      categoryTitleEn: item?.categoryTitle?.en || "",
      order: item?.order || 0,
      status: item?.status || "active",
      iconImage: null,
    });

    setPreview(item?.iconImageUrl || "");
    setOldImageUrl(item?.iconImageUrl || "");
    setRemoveOldImage(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDeleteModal = (item) => {
    setDeleteModal({
      open: true,
      id: item._id,
      title: item?.categoryTitle?.en || item?.categoryName?.en || "Category",
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
      const res = await api.delete(`/api/game-categories/${deleteModal.id}`);
      toast.success(res?.data?.message || "Category deleted successfully");

      if (editId === deleteModal.id) {
        resetForm();
      }

      closeDeleteModal();
      fetchCategories();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete category",
      );
    }
  };

  return (
    <div className="min-h-full text-white">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/25 to-black shadow-2xl shadow-blue-950/40">
          <div className="border-b border-blue-300/20 bg-gradient-to-r from-black/80 via-[#2f79c9]/40 to-black/80 px-5 py-5 md:px-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-700/40">
                  <FaLayerGroup className="text-2xl text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                    {isEdit ? "Update Game Category" : "Add Game Category"}
                  </h1>
                  <p className="mt-1 text-sm text-blue-100/80">
                    Category name, title, icon, order and status manage করুন।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchCategories}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-300/20 bg-black/35 px-5 py-3 font-bold text-blue-100 transition-all hover:bg-white/10"
              >
                <FaSyncAlt className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-6 xl:grid-cols-3"
            >
              <div className="space-y-5 xl:col-span-2">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Category Name Bangla
                    </label>
                    <input
                      type="text"
                      name="categoryNameBn"
                      value={formData.categoryNameBn}
                      onChange={handleChange}
                      placeholder="যেমন: ক্যাসিনো"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Category Name English
                    </label>
                    <input
                      type="text"
                      name="categoryNameEn"
                      value={formData.categoryNameEn}
                      onChange={handleChange}
                      placeholder="Like: Casino"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Category Title Bangla
                    </label>
                    <input
                      type="text"
                      name="categoryTitleBn"
                      value={formData.categoryTitleBn}
                      onChange={handleChange}
                      placeholder="যেমন: ক্যাসিনো গেমস"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Category Title English
                    </label>
                    <input
                      type="text"
                      name="categoryTitleEn"
                      value={formData.categoryTitleEn}
                      onChange={handleChange}
                      placeholder="Like: Casino Games"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Order Number
                    </label>
                    <input
                      type="number"
                      min="0"
                      name="order"
                      value={formData.order}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option className="bg-black" value="active">
                        Active
                      </option>
                      <option className="bg-black" value="inactive">
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
                      Click to upload icon image
                    </span>
                    <span className="mt-1 text-sm text-blue-100/65">
                      PNG, JPG, JPEG, WEBP, SVG, AVIF, GIF
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-6 py-3 font-black text-white shadow-lg shadow-blue-700/40 transition-all hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isEdit ? <FaSave /> : <FaPlus />}
                    {submitLoading
                      ? isEdit
                        ? "Updating..."
                        : "Adding..."
                      : isEdit
                        ? "Update Category"
                        : "Add Category"}
                  </button>

                  {(isEdit || preview) && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-6 py-3 font-bold text-red-200 transition-all hover:bg-red-500/20"
                    >
                      <FaTimes />
                      Cancel
                    </button>
                  )}

                  {preview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 px-6 py-3 font-bold text-yellow-200 transition-all hover:bg-yellow-500/20"
                    >
                      Remove Image
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
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FaImage className="text-4xl text-[#8fc2f5]/80" />
                        )}
                      </div>

                      <h4 className="mt-4 text-xl font-black text-white">
                        {formData.categoryTitleEn || "Category Title"}
                      </h4>

                      <p className="mt-1 text-sm text-blue-100/75">
                        {formData.categoryTitleBn || "ক্যাটাগরি টাইটেল"}
                      </p>

                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <span className="rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-sm text-blue-100">
                          Order: {formData.order || 0}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-sm ${
                            formData.status === "active"
                              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                              : "border-red-400/30 bg-red-500/10 text-red-200"
                          }`}
                        >
                          {formData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="border-t border-blue-300/20 p-4 md:p-6 lg:p-8">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-black md:text-2xl">
                All Game Categories
              </h2>

              <span className="rounded-full border border-blue-300/20 bg-black/35 px-4 py-2 text-sm font-bold text-blue-100">
                Total: {categories.length}
              </span>
            </div>

            {loading ? (
              <div className="py-10 text-center text-blue-100">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="rounded-3xl border border-blue-300/20 bg-black/30 py-12 text-center text-blue-100">
                No category found
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black p-5 shadow-xl shadow-blue-950/30"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-blue-300/20 bg-black/45">
                        {item.iconImageUrl ? (
                          <img
                            src={item.iconImageUrl}
                            alt={item?.categoryTitle?.en || "Category"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FaImage className="text-3xl text-[#8fc2f5]/80" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-black text-white">
                          {item?.categoryTitle?.en || "No Title"}
                        </h3>

                        <p className="mt-1 truncate text-sm text-blue-100/75">
                          {item?.categoryTitle?.bn || "No Bangla Title"}
                        </p>

                        <p className="mt-1 truncate text-xs text-blue-100/50">
                          Name: {item?.categoryName?.en || "N/A"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-100">
                            Order: {item.order}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs ${
                              item.status === "active"
                                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                                : "border-red-400/30 bg-red-500/10 text-red-200"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-4 py-3 font-black text-white shadow-md shadow-blue-700/30 transition-all hover:from-[#7bb7f1] hover:to-[#3b88db]"
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(item)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 font-black text-red-200 transition-all hover:bg-red-500/20"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
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
              তুমি কি নিশ্চিত "{deleteModal.title}" category delete করতে চাও?
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

export default AddCategories;

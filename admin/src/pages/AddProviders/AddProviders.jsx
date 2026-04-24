import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaSave,
  FaTimes,
  FaTrash,
  FaEdit,
  FaPlus,
  FaImage,
  FaServer,
  FaSyncAlt,
  FaHome,
} from "react-icons/fa";
import { api } from "../../api/axios";

const ORACLE_PROVIDER_API = "https://api.oraclegames.live/api/providers";
const ORACLE_PROVIDER_KEY = import.meta.env.VITE_ORACLE_TOKEN;

const initialForm = {
  categoryId: "",
  providerId: "",
  providerIcon: null,
  providerImage: null,
  status: "active",
  isHome: false,
};

const inputClass =
  "w-full rounded-2xl border border-blue-300/20 bg-black/45 px-4 py-3 text-white placeholder-blue-100/40 outline-none transition-all focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/30";

const AddProviders = () => {
  const [categories, setCategories] = useState([]);
  const [oracleProviders, setOracleProviders] = useState([]);
  const [savedProviders, setSavedProviders] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [iconPreview, setIconPreview] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [oldIconUrl, setOldIconUrl] = useState("");
  const [oldImageUrl, setOldImageUrl] = useState("");

  const [removeOldIcon, setRemoveOldIcon] = useState(false);
  const [removeOldImage, setRemoveOldImage] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    providerId: "",
  });

  const isEdit = useMemo(() => Boolean(editId), [editId]);

  const loadCategories = async () => {
    try {
      const res = await api.get("/api/game-categories/admin/all");
      setCategories(res?.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load categories",
      );
    }
  };

  const loadOracleProviders = async () => {
    try {
      const res = await axios.get(ORACLE_PROVIDER_API, {
        headers: {
          "x-api-key": ORACLE_PROVIDER_KEY,
        },
      });

      setOracleProviders(res?.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load providers from API",
      );
    }
  };

  const loadSavedProviders = async (categoryId) => {
    try {
      if (!categoryId) {
        setSavedProviders([]);
        return;
      }

      setListLoading(true);
      const res = await api.get(`/api/game-providers?categoryId=${categoryId}`);
      setSavedProviders(res?.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load providers");
    } finally {
      setListLoading(false);
    }
  };

  const loadPageData = async () => {
    try {
      setPageLoading(true);
      await Promise.all([loadCategories(), loadOracleProviders()]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    if (form.categoryId) {
      loadSavedProviders(form.categoryId);
    } else {
      setSavedProviders([]);
    }
  }, [form.categoryId]);

  useEffect(() => {
    if (form.providerIcon instanceof File) {
      const url = URL.createObjectURL(form.providerIcon);
      setIconPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    setIconPreview(oldIconUrl || "");
  }, [form.providerIcon, oldIconUrl]);

  useEffect(() => {
    if (form.providerImage instanceof File) {
      const url = URL.createObjectURL(form.providerImage);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }

    setImagePreview(oldImageUrl || "");
  }, [form.providerImage, oldImageUrl]);

  const getProviderName = (providerCode) => {
    const found = oracleProviders.find(
      (item) => String(item.providerCode) === String(providerCode),
    );

    return found?.providerName || "Unknown Provider";
  };

  const selectedCategoryName = useMemo(() => {
    const category = categories.find((item) => item._id === form.categoryId);
    return category?.categoryName?.en || "";
  }, [categories, form.categoryId]);

  const selectedProviderName = useMemo(() => {
    return getProviderName(form.providerId);
  }, [form.providerId, oracleProviders]);

  const clearFileStates = () => {
    setIconPreview("");
    setImagePreview("");
    setOldIconUrl("");
    setOldImageUrl("");
    setRemoveOldIcon(false);
    setRemoveOldImage(false);
  };

  const resetForm = () => {
    setForm((prev) => ({
      ...initialForm,
      categoryId: prev.categoryId || "",
    }));

    setEditId(null);
    clearFileStates();
  };

  const handleProviderSelect = (providerCode) => {
    setForm((prev) => ({
      ...prev,
      providerId: providerCode,
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      providerIcon: file,
    }));

    setRemoveOldIcon(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      providerImage: file,
    }));

    setRemoveOldImage(false);
  };

  const handleRemoveIcon = () => {
    setForm((prev) => ({
      ...prev,
      providerIcon: null,
    }));

    setIconPreview("");

    if (oldIconUrl) {
      setRemoveOldIcon(true);
      setOldIconUrl("");
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({
      ...prev,
      providerImage: null,
    }));

    setImagePreview("");

    if (oldImageUrl) {
      setRemoveOldImage(true);
      setOldImageUrl("");
    }
  };

  const startEdit = (provider) => {
    setEditId(provider._id);

    setForm({
      categoryId: provider?.categoryId?._id || provider?.categoryId || "",
      providerId: provider?.providerId || "",
      providerIcon: null,
      providerImage: null,
      status: provider?.status || "active",
      isHome: Boolean(provider?.isHome),
    });

    setOldIconUrl(provider?.providerIconUrl || "");
    setOldImageUrl(provider?.providerImageUrl || "");
    setRemoveOldIcon(false);
    setRemoveOldImage(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.categoryId) {
      toast.error("Please select a category");
      return;
    }

    if (!form.providerId) {
      toast.error("Please select a provider");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("categoryId", form.categoryId);
      fd.append("providerId", form.providerId);
      fd.append("status", form.status);
      fd.append("isHome", form.isHome ? "true" : "false");

      if (form.providerIcon instanceof File) {
        fd.append("providerIcon", form.providerIcon);
      }

      if (form.providerImage instanceof File) {
        fd.append("providerImage", form.providerImage);
      }

      if (isEdit) {
        fd.append("removeOldIcon", removeOldIcon ? "true" : "false");
        fd.append("removeOldImage", removeOldImage ? "true" : "false");

        const res = await api.put(`/api/game-providers/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(res?.data?.message || "Provider updated successfully");
      } else {
        const res = await api.post("/api/game-providers", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(res?.data?.message || "Provider added successfully");
      }

      const selectedCategory = form.categoryId;

      setForm({
        ...initialForm,
        categoryId: selectedCategory,
      });

      setEditId(null);
      clearFileStates();
      loadSavedProviders(selectedCategory);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (provider) => {
    setDeleteModal({
      open: true,
      id: provider._id,
      providerId: provider.providerId,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      open: false,
      id: null,
      providerId: "",
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/api/game-providers/${deleteModal.id}`);
      toast.success(res?.data?.message || "Provider deleted successfully");

      if (editId === deleteModal.id) {
        resetForm();
      }

      closeDeleteModal();

      if (form.categoryId) {
        loadSavedProviders(form.categoryId);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete provider",
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
                  <FaServer className="text-2xl text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                    {isEdit ? "Update Game Provider" : "Add Game Provider"}
                  </h1>
                  <p className="mt-1 text-sm text-blue-100/80">
                    Provider icon এবং provider image দুইটাই এখান থেকে manage
                    করুন।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadPageData}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-300/20 bg-black/35 px-5 py-3 font-bold text-blue-100 transition-all hover:bg-white/10"
              >
                <FaSyncAlt className={pageLoading ? "animate-spin" : ""} />
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
                <div>
                  <label className="mb-2 block text-sm font-bold text-blue-100">
                    Select Game Category
                  </label>

                  <select
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option className="bg-black" value="">
                      Choose category...
                    </option>

                    {categories.map((cat) => (
                      <option
                        className="bg-black"
                        key={cat._id}
                        value={cat._id}
                      >
                        {cat?.categoryName?.en} • {cat?.categoryName?.bn}
                      </option>
                    ))}
                  </select>

                  {form.categoryId && (
                    <p className="mt-2 text-xs text-blue-100/75">
                      Selected Category:{" "}
                      <span className="font-bold text-[#8fc2f5]">
                        {selectedCategoryName}
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-blue-100">
                    Select Provider
                  </label>

                  <select
                    value={form.providerId}
                    onChange={(e) => handleProviderSelect(e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option className="bg-black" value="">
                      Choose provider...
                    </option>

                    {oracleProviders.map((provider) => (
                      <option
                        className="bg-black"
                        key={provider._id || provider.providerCode}
                        value={provider.providerCode}
                      >
                        {provider.providerName} ({provider.providerCode})
                      </option>
                    ))}
                  </select>

                  {form.providerId && (
                    <p className="mt-2 text-xs text-blue-100/75">
                      Selected Provider:{" "}
                      <span className="font-bold text-[#8fc2f5]">
                        {selectedProviderName}
                      </span>{" "}
                      • Code:{" "}
                      <span className="font-mono text-white">
                        {form.providerId}
                      </span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Provider Icon
                    </label>

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-300/25 bg-black/35 p-6 text-center transition-all hover:border-[#63a8ee] hover:bg-white/10">
                      <FaImage className="mb-3 text-4xl text-[#8fc2f5]" />
                      <span className="text-base font-bold text-white">
                        Upload provider icon
                      </span>
                      <span className="mt-1 text-sm text-blue-100/65">
                        Small logo/icon
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconChange}
                        className="hidden"
                      />
                    </label>

                    {iconPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveIcon}
                        className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-200 transition-all hover:bg-yellow-500/20"
                      >
                        <FaTimes />
                        Remove Icon
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Provider Image
                    </label>

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-300/25 bg-black/35 p-6 text-center transition-all hover:border-[#63a8ee] hover:bg-white/10">
                      <FaImage className="mb-3 text-4xl text-[#8fc2f5]" />
                      <span className="text-base font-bold text-white">
                        Upload provider image
                      </span>
                      <span className="mt-1 text-sm text-blue-100/65">
                        Banner/card image
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-200 transition-all hover:bg-yellow-500/20"
                      >
                        <FaTimes />
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Status
                    </label>

                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
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

                  <div>
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Show On Home
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          isHome: !prev.isHome,
                        }))
                      }
                      className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 font-bold transition-all ${
                        form.isHome
                          ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                          : "border-blue-300/20 bg-black/45 text-blue-100"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <FaHome />
                        {form.isHome ? "Home Active" : "Home Inactive"}
                      </span>

                      <span
                        className={`h-6 w-12 rounded-full p-1 transition-all ${
                          form.isHome ? "bg-emerald-500" : "bg-white/20"
                        }`}
                      >
                        <span
                          className={`block h-4 w-4 rounded-full bg-white transition-all ${
                            form.isHome ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-6 py-3 font-black text-white shadow-lg shadow-blue-700/40 transition-all hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isEdit ? <FaSave /> : <FaPlus />}
                    {loading
                      ? isEdit
                        ? "Updating..."
                        : "Adding..."
                      : isEdit
                        ? "Update Provider"
                        : "Add Provider"}
                  </button>

                  {(isEdit || iconPreview || imagePreview) && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-6 py-3 font-bold text-red-200 transition-all hover:bg-red-500/20"
                    >
                      <FaTimes />
                      Cancel
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
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-blue-300/25 bg-black/45">
                        {iconPreview ? (
                          <img
                            src={iconPreview}
                            alt="Icon Preview"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <FaImage className="text-4xl text-[#8fc2f5]/80" />
                        )}
                      </div>

                      <div className="mt-4 h-32 w-full overflow-hidden rounded-2xl border border-blue-300/20 bg-black/40">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Provider Preview"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-blue-100/50">
                            Provider Image
                          </div>
                        )}
                      </div>

                      <h4 className="mt-4 text-xl font-black text-white">
                        {selectedProviderName !== "Unknown Provider"
                          ? selectedProviderName
                          : "Provider Name"}
                      </h4>

                      <p className="mt-1 font-mono text-sm text-blue-100/75">
                        {form.providerId || "Provider Code"}
                      </p>

                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <span className="rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-sm text-blue-100">
                          {selectedCategoryName || "No Category"}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-sm ${
                            form.status === "active"
                              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                              : "border-red-400/30 bg-red-500/10 text-red-200"
                          }`}
                        >
                          {form.status}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-sm ${
                            form.isHome
                              ? "border-sky-300/30 bg-sky-400/10 text-sky-100"
                              : "border-white/15 bg-white/5 text-white/60"
                          }`}
                        >
                          {form.isHome ? "Home: Yes" : "Home: No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="border-t border-blue-300/20 p-4 md:p-6 lg:p-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-black md:text-2xl">
                Saved Providers
                {form.categoryId && (
                  <span className="ml-2 text-blue-100/70">
                    ({selectedCategoryName})
                  </span>
                )}
              </h2>

              {form.categoryId && (
                <button
                  type="button"
                  onClick={() => loadSavedProviders(form.categoryId)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-300/20 bg-black/35 px-5 py-2.5 text-sm font-bold text-blue-100 transition-all hover:bg-white/10"
                >
                  <FaSyncAlt className={listLoading ? "animate-spin" : ""} />
                  Refresh List
                </button>
              )}
            </div>

            {!form.categoryId ? (
              <div className="rounded-3xl border border-blue-300/20 bg-black/30 py-12 text-center text-blue-100">
                Select a category to view or add providers
              </div>
            ) : listLoading ? (
              <div className="rounded-3xl border border-blue-300/20 bg-black/30 py-12 text-center text-blue-100">
                Loading providers...
              </div>
            ) : savedProviders.length === 0 ? (
              <div className="rounded-3xl border border-blue-300/20 bg-black/30 py-12 text-center text-blue-100">
                No providers found in this category
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {savedProviders.map((provider) => (
                  <div
                    key={provider._id}
                    className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black p-5 shadow-xl shadow-blue-950/30"
                  >
                    <div className="h-32 overflow-hidden rounded-2xl border border-blue-300/20 bg-black/45">
                      {provider.providerImageUrl ? (
                        <img
                          src={provider.providerImageUrl}
                          alt={provider.providerId}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-blue-100/45">
                          No Provider Image
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-start gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-blue-300/20 bg-black/45">
                        {provider.providerIconUrl ? (
                          <img
                            src={provider.providerIconUrl}
                            alt={provider.providerId}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <FaImage className="text-3xl text-[#8fc2f5]/80" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-black text-white">
                          {getProviderName(provider.providerId)}
                        </h3>

                        <p className="mt-1 truncate font-mono text-sm text-blue-100/75">
                          {provider.providerId}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-100">
                            {provider?.categoryId?.categoryName?.en ||
                              "Category"}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs ${
                              provider.status === "active"
                                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                                : "border-red-400/30 bg-red-500/10 text-red-200"
                            }`}
                          >
                            {provider.status}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs ${
                              provider.isHome
                                ? "border-sky-300/30 bg-sky-400/10 text-sky-100"
                                : "border-white/15 bg-white/5 text-white/60"
                            }`}
                          >
                            {provider.isHome ? "Home" : "Not Home"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(provider)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-4 py-3 font-black text-white shadow-md shadow-blue-700/30 transition-all hover:from-[#7bb7f1] hover:to-[#3b88db]"
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(provider)}
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
              তুমি কি নিশ্চিত{" "}
              <span className="font-bold text-white">
                {deleteModal.providerId}
              </span>{" "}
              provider delete করতে চাও?
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

export default AddProviders;

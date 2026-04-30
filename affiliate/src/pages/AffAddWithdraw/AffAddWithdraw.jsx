import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaSyncAlt,
  FaSave,
  FaImage,
  FaListAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { PiHandWithdrawBold } from "react-icons/pi";
import { api } from "../../api/axios";
import {
  selectUser,
  selectIsSuperAffUser,
} from "../../features/auth/authSelectors";

const emptyBi = { bn: "", en: "" };

const defaultField = () => ({
  key: "",
  label: { ...emptyBi },
  placeholder: { ...emptyBi },
  type: "text",
  required: true,
});

const sectionCard =
  "rounded-3xl border border-blue-200/15 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black shadow-2xl shadow-blue-900/30 overflow-hidden";

const inputBase =
  "w-full h-11 rounded-2xl border border-blue-200/15 bg-black/40 px-4 text-white placeholder-blue-100/35 outline-none focus:ring-2 focus:ring-[#63a8ee]/30 focus:border-[#63a8ee] transition";

const labelBase = "mb-2 block text-sm font-semibold text-blue-100/85";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer";

const btnPrimary = `${btnBase} bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white border border-blue-300/20 shadow-lg shadow-blue-800/20 hover:from-[#7bb7f1] hover:to-[#3b88db]`;

const btnSecondary = `${btnBase} bg-black/35 text-blue-100 border border-blue-200/15 hover:bg-black/55`;

const btnDanger = `${btnBase} bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-400/20 hover:from-red-500 hover:to-rose-500`;

const miniStatCard = "rounded-2xl border border-blue-200/12 bg-black/25 p-4";

const getAssetUrl = (url = "") => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  const base = import.meta.env.VITE_API_URL || "";
  const clean = url.startsWith("/") ? url : `/${url}`;

  return `${base}${clean}`;
};

const getUserId = (user) => user?._id || user?.id || "";

const Toggle = ({ checked, onChange, label }) => {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={`h-6 w-12 rounded-full transition ${
            checked ? "bg-[#2f79c9]" : "bg-white/15"
          }`}
        />
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-[26px]" : "left-[2px]"
          }`}
        />
      </div>
      <span className="text-sm font-medium text-blue-100/85">{label}</span>
    </label>
  );
};

const BiInput = ({ title, bnProps, enProps }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div>
      <label className={labelBase}>{title} (BN)</label>
      <input className={inputBase} {...bnProps} />
    </div>
    <div>
      <label className={labelBase}>{title} (EN)</label>
      <input className={inputBase} {...enProps} />
    </div>
  </div>
);

const ConfirmDeleteModal = ({
  open,
  onClose,
  onConfirm,
  name,
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      <div className="relative w-full max-w-md rounded-3xl border border-blue-200/15 bg-gradient-to-b from-black via-[#1d4175] to-black p-6 text-white shadow-2xl shadow-blue-900/40">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/15">
            <FaTrash className="text-lg text-red-300" />
          </div>

          <div className="min-w-0">
            <h3 className="text-xl font-extrabold tracking-tight">
              Delete Withdraw Method
            </h3>
            <p className="mt-2 text-sm leading-6 text-blue-100/75">
              Are you sure you want to delete{" "}
              <span className="font-bold text-white">
                {name || "this method"}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={btnSecondary}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={btnDanger}
          >
            {loading ? <FaSyncAlt className="animate-spin" /> : <FaTrash />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AffAddWithdraw = () => {
  const qc = useQueryClient();

  const user = useSelector(selectUser);
  const isSuperAffUser = useSelector(selectIsSuperAffUser);
  const ownerId = getUserId(user);

  const {
    data: list = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-aff-withdraw-methods", ownerId],
    enabled: !!ownerId && isSuperAffUser,
    queryFn: async () => {
      const res = await api.get(
        `/api/admin/aff-withdraw-methods?ownerId=${ownerId}`,
      );

      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data?.data)) return res.data.data;

      return [];
    },
    staleTime: 10000,
  });

  const { register, reset, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      methodId: "",
      name_bn: "",
      name_en: "",
      isActive: true,
      minimumWithdrawAmount: 0,
      maximumWithdrawAmount: 0,
    },
  });

  const [selectedId, setSelectedId] = useState("");
  const [fields, setFields] = useState([defaultField()]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState("");
  const [deleteName, setDeleteName] = useState("");

  const selected = useMemo(
    () => list.find((item) => item._id === selectedId) || null,
    [list, selectedId],
  );

  const isCreateMode = !selectedId;

  useEffect(() => {
    setLogoFile(null);
    setLogoPreview(null);

    if (!selected) {
      reset({
        methodId: "",
        name_bn: "",
        name_en: "",
        isActive: true,
        minimumWithdrawAmount: 0,
        maximumWithdrawAmount: 0,
      });
      setFields([defaultField()]);
      return;
    }

    reset({
      methodId: selected.methodId || "",
      name_bn: selected.name?.bn || "",
      name_en: selected.name?.en || "",
      isActive: selected.isActive ?? true,
      minimumWithdrawAmount: Number(selected.minimumWithdrawAmount ?? 0),
      maximumWithdrawAmount: Number(selected.maximumWithdrawAmount ?? 0),
    });

    setFields(
      Array.isArray(selected.fields) && selected.fields.length
        ? selected.fields.map((f) => ({
            key: f.key || "",
            label: {
              bn: f.label?.bn || "",
              en: f.label?.en || "",
            },
            placeholder: {
              bn: f.placeholder?.bn || "",
              en: f.placeholder?.en || "",
            },
            type: f.type || "text",
            required: f.required !== false,
          }))
        : [defaultField()],
    );

    if (selected.logoUrl) {
      setLogoPreview(getAssetUrl(selected.logoUrl));
    }
  }, [selected, reset]);

  const clearForm = () => {
    setSelectedId("");
    setLogoFile(null);
    setLogoPreview(null);
    setFields([defaultField()]);
    reset({
      methodId: "",
      name_bn: "",
      name_en: "",
      isActive: true,
      minimumWithdrawAmount: 0,
      maximumWithdrawAmount: 0,
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const addField = () => {
    setFields((prev) => [...prev, defaultField()]);
  };

  const removeField = (idx) => {
    setFields((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  };

  const patchField = (idx, key, value) => {
    setFields((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
    );
  };

  const patchFieldBi = (idx, key, lang, value) => {
    setFields((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [key]: {
                ...(item[key] || emptyBi),
                [lang]: value,
              },
            }
          : item,
      ),
    );
  };

  const validateBeforeSave = (values) => {
    if (!isSuperAffUser || !ownerId) {
      return "Only super affiliate user can manage withdraw methods";
    }

    const methodId = String(values.methodId || "")
      .trim()
      .toUpperCase();

    if (!methodId) return "Method ID is required";

    if (
      !String(values.name_bn || "").trim() ||
      !String(values.name_en || "").trim()
    ) {
      return "Both BN and EN method names are required";
    }

    const minAmount = Number(values.minimumWithdrawAmount ?? 0);
    const maxAmount = Number(values.maximumWithdrawAmount ?? 0);

    if (!Number.isFinite(minAmount) || minAmount < 0) {
      return "Minimum withdraw amount must be valid";
    }

    if (!Number.isFinite(maxAmount) || maxAmount < 0) {
      return "Maximum withdraw amount must be valid";
    }

    if (maxAmount > 0 && minAmount > maxAmount) {
      return "Minimum withdraw amount cannot exceed maximum";
    }

    const keys = new Set();

    for (const field of fields) {
      const key = String(field.key || "").trim();

      if (!key) return "Field key is required";

      if (keys.has(key.toLowerCase())) {
        return `Duplicate field key found: ${key}`;
      }

      keys.add(key.toLowerCase());

      if (
        !String(field.label?.bn || "").trim() ||
        !String(field.label?.en || "").trim()
      ) {
        return "Field label BN and EN are required";
      }
    }

    return null;
  };

  const onSave = async (values) => {
    const error = validateBeforeSave(values);

    if (error) {
      toast.error(error);
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();

      payload.append("ownerId", ownerId);

      payload.append(
        "methodId",
        String(values.methodId || "")
          .trim()
          .toUpperCase(),
      );

      payload.append(
        "name",
        JSON.stringify({
          bn: String(values.name_bn || "").trim(),
          en: String(values.name_en || "").trim(),
        }),
      );

      payload.append("isActive", String(!!values.isActive));
      payload.append(
        "minimumWithdrawAmount",
        String(values.minimumWithdrawAmount ?? 0),
      );
      payload.append(
        "maximumWithdrawAmount",
        String(values.maximumWithdrawAmount ?? 0),
      );

      payload.append("fields", JSON.stringify(fields));

      if (logoFile) {
        payload.append("logo", logoFile);
      }

      if (selected?._id) {
        await api.put(
          `/api/admin/aff-withdraw-methods/${selected._id}`,
          payload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        toast.success("Affiliate withdraw method updated successfully");
      } else {
        await api.post("/api/admin/aff-withdraw-methods", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Affiliate withdraw method created successfully");
      }

      await qc.invalidateQueries({
        queryKey: ["admin-aff-withdraw-methods", ownerId],
      });

      await refetch();

      if (isCreateMode) {
        clearForm();
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    if (!isSuperAffUser || !ownerId) {
      toast.error("Only super affiliate user can delete withdraw methods");
      return;
    }

    try {
      setSaving(true);

      await api.delete(
        `/api/admin/aff-withdraw-methods/${deleteId}?ownerId=${ownerId}`,
      );

      toast.success("Affiliate withdraw method deleted successfully");

      setDeleteId("");
      setDeleteName("");

      await qc.invalidateQueries({
        queryKey: ["admin-aff-withdraw-methods", ownerId],
      });

      await refetch();

      if (selectedId === deleteId) {
        clearForm();
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAffUser) {
    return (
      <div className="p-4 lg:p-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-red-200">
          <h2 className="text-xl font-extrabold text-white">Access Denied</h2>
          <p className="mt-2 text-sm text-red-100/80">
            Only super affiliate users can manage affiliate withdraw methods.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className={sectionCard}>
          <div className="border-b border-blue-200/10 bg-gradient-to-r from-black/70 via-[#2f79c9]/45 to-black/70 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-300/20 bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-800/20">
                  <PiHandWithdrawBold className="text-3xl text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    {isCreateMode
                      ? "Create Affiliate Withdraw Method"
                      : "Update Affiliate Withdraw Method"}
                  </h1>
                  <p className="mt-1 text-sm text-blue-100/75">
                    Only your referred affiliate users can see these withdraw
                    methods.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {!isCreateMode && selected?._id && (
                  <button
                    type="button"
                    onClick={() =>
                      requestDelete(
                        selected._id,
                        selected.name?.en || selected.methodId || "this method",
                      )
                    }
                    disabled={saving}
                    className={btnDanger}
                  >
                    <FaTrash />
                    Delete Method
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSubmit(onSave)}
                  disabled={saving}
                  className={btnPrimary}
                >
                  {saving ? <FaSyncAlt className="animate-spin" /> : <FaSave />}
                  {isCreateMode ? "Create Method" : "Update Method"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className={miniStatCard}>
                <div className="text-sm text-blue-100/65">Mode</div>
                <div className="mt-1 text-lg font-extrabold text-white">
                  {isCreateMode ? "Create" : "Edit"}
                </div>
              </div>

              <div className={miniStatCard}>
                <div className="text-sm text-blue-100/65">Total Methods</div>
                <div className="mt-1 text-lg font-extrabold text-white">
                  {list.length}
                </div>
              </div>

              <div className={miniStatCard}>
                <div className="text-sm text-blue-100/65">Custom Fields</div>
                <div className="mt-1 text-lg font-extrabold text-white">
                  {fields.length}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="space-y-5 rounded-3xl border border-blue-200/10 bg-black/25 p-5">
                <h2 className="text-lg font-bold text-[#a8d1fb]">
                  Basic Information
                </h2>

                <div>
                  <label className={labelBase}>
                    Method ID (unique for this super affiliate)
                  </label>
                  <input
                    className={inputBase}
                    placeholder="NAGAD / BKASH / ROCKET"
                    {...register("methodId")}
                    onChange={(e) =>
                      setValue("methodId", e.target.value.toUpperCase())
                    }
                  />
                </div>

                <BiInput
                  title="Method Name"
                  bnProps={{
                    ...register("name_bn"),
                    placeholder: "যেমন: নগদ",
                  }}
                  enProps={{
                    ...register("name_en"),
                    placeholder: "e.g. Nagad",
                  }}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelBase}>Minimum Withdraw Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className={inputBase}
                      {...register("minimumWithdrawAmount", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div>
                    <label className={labelBase}>Maximum Withdraw Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className={inputBase}
                      {...register("maximumWithdrawAmount", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelBase}>Status</label>
                  <Toggle
                    checked={!!watch("isActive")}
                    onChange={(e) => setValue("isActive", e.target.checked)}
                    label={watch("isActive") ? "Active" : "Inactive"}
                  />
                </div>
              </div>

              <div className="space-y-5 rounded-3xl border border-blue-200/10 bg-black/25 p-5">
                <h2 className="text-lg font-bold text-[#a8d1fb]">
                  Method Logo
                </h2>

                <div className="flex flex-col items-start gap-5 sm:flex-row">
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-dashed border-blue-300/20 bg-black/40">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-blue-100/35">
                        <FaImage className="text-2xl" />
                        <span className="text-xs font-semibold">NO LOGO</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="aff-withdraw-logo" className={btnSecondary}>
                      <FaImage />
                      Choose Image
                    </label>

                    <input
                      id="aff-withdraw-logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />

                    {logoFile ? (
                      <div className="text-sm text-blue-100/75">
                        Selected:{" "}
                        <span className="font-semibold">{logoFile.name}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-blue-100/45">
                        PNG, JPG, WEBP, SVG, AVIF, GIF supported
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-blue-200/10 bg-black/25 p-5">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#a8d1fb]">
                    Withdraw Form Fields
                  </h2>
                  <p className="mt-1 text-sm text-blue-100/55">
                    Add custom fields for affiliate withdraw request form.
                  </p>
                </div>

                <button type="button" onClick={addField} className={btnPrimary}>
                  <FaPlus />
                  Add Field
                </button>
              </div>

              <div className="space-y-5">
                {fields.map((field, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-blue-200/10 bg-gradient-to-br from-black/45 to-[#2f79c9]/8 p-5"
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-300/10 bg-[#2f79c9]/20 text-[#8fc2f5]">
                          <FaListAlt />
                        </div>

                        <div>
                          <div className="font-bold text-white">
                            Field #{idx + 1}
                          </div>
                          <div className="text-xs text-blue-100/50">
                            Custom input configuration
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeField(idx)}
                        disabled={fields.length === 1}
                        className={btnDanger}
                      >
                        <FaTrash />
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className={labelBase}>Key</label>
                        <input
                          className={inputBase}
                          value={field.key || ""}
                          onChange={(e) =>
                            patchField(idx, "key", e.target.value)
                          }
                          placeholder="accountNumber / walletType / email"
                        />
                      </div>

                      <div>
                        <label className={labelBase}>Type</label>
                        <select
                          className={inputBase}
                          value={field.type || "text"}
                          onChange={(e) =>
                            patchField(idx, "type", e.target.value)
                          }
                        >
                          <option value="text">text</option>
                          <option value="number">number</option>
                          <option value="tel">tel</option>
                          <option value="email">email</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <BiInput
                        title="Label"
                        bnProps={{
                          value: field.label?.bn || "",
                          onChange: (e) =>
                            patchFieldBi(idx, "label", "bn", e.target.value),
                          placeholder: "বাংলা লেবেল",
                        }}
                        enProps={{
                          value: field.label?.en || "",
                          onChange: (e) =>
                            patchFieldBi(idx, "label", "en", e.target.value),
                          placeholder: "English label",
                        }}
                      />
                    </div>

                    <div className="mt-4">
                      <BiInput
                        title="Placeholder"
                        bnProps={{
                          value: field.placeholder?.bn || "",
                          onChange: (e) =>
                            patchFieldBi(
                              idx,
                              "placeholder",
                              "bn",
                              e.target.value,
                            ),
                          placeholder: "বাংলা placeholder",
                        }}
                        enProps={{
                          value: field.placeholder?.en || "",
                          onChange: (e) =>
                            patchFieldBi(
                              idx,
                              "placeholder",
                              "en",
                              e.target.value,
                            ),
                          placeholder: "English placeholder",
                        }}
                      />
                    </div>

                    <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <Toggle
                        checked={field.required !== false}
                        onChange={(e) =>
                          patchField(idx, "required", e.target.checked)
                        }
                        label={
                          field.required !== false ? "Required" : "Optional"
                        }
                      />

                      <div className="text-xs text-blue-100/45">
                        Tip: field key should be unique.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={sectionCard}>
          <div className="border-b border-blue-200/10 bg-gradient-to-r from-black/70 via-[#2f79c9]/35 to-black/70 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white">
                  My Affiliate Withdraw Methods
                </h2>
                <p className="mt-1 text-sm text-blue-100/70">
                  These methods are visible only to your referred affiliate
                  users.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={refetch}
                  className={btnSecondary}
                >
                  <FaSyncAlt />
                  Refresh List
                </button>

                <button
                  type="button"
                  onClick={clearForm}
                  className={btnPrimary}
                >
                  <FaPlus />
                  New Method
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {isLoading ? (
              <div className="py-16 text-center text-blue-100/55">
                Loading withdraw methods...
              </div>
            ) : list.length === 0 ? (
              <div className="py-16 text-center text-blue-100/45">
                No affiliate withdraw methods found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {list.map((item) => {
                  const displayName =
                    item.name?.en || item.methodId || "Unnamed";

                  return (
                    <div
                      key={item._id}
                      className="rounded-3xl border border-blue-200/10 bg-gradient-to-br from-black/50 to-[#2f79c9]/10 p-5 shadow-lg shadow-blue-900/10"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-blue-200/10 bg-black/30">
                          {item.logoUrl ? (
                            <img
                              src={getAssetUrl(item.logoUrl)}
                              alt={displayName}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="text-center text-[11px] font-bold text-blue-100/30">
                              NO LOGO
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-lg font-bold text-white">
                            {displayName}
                          </div>

                          <div className="mt-1 text-xs text-blue-100/55">
                            ID: {item.methodId}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${
                                item.isActive
                                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                                  : "border-red-400/20 bg-red-500/10 text-red-300"
                              }`}
                            >
                              {item.isActive ? (
                                <FaCheckCircle />
                              ) : (
                                <FaTimesCircle />
                              )}
                              {item.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-3">
                          <div className="text-[11px] text-blue-100/45">
                            Min Withdraw
                          </div>
                          <div className="mt-1 text-sm font-bold text-white">
                            {Number(item.minimumWithdrawAmount ?? 0)}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-3">
                          <div className="text-[11px] text-blue-100/45">
                            Max Withdraw
                          </div>
                          <div className="mt-1 text-sm font-bold text-white">
                            {Number(item.maximumWithdrawAmount ?? 0)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl border border-blue-200/10 bg-black/25 p-3">
                        <div className="text-[11px] text-blue-100/45">
                          Fields
                        </div>
                        <div className="mt-1 text-sm font-bold text-white">
                          {Array.isArray(item.fields) ? item.fields.length : 0}
                        </div>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(item._id)}
                          className={`${btnPrimary} flex-1`}
                        >
                          <FaEdit />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => requestDelete(item._id, displayName)}
                          className={btnDanger}
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        open={!!deleteId}
        onClose={() => {
          setDeleteId("");
          setDeleteName("");
        }}
        onConfirm={confirmDelete}
        name={deleteName}
        loading={saving}
      />
    </div>
  );
};

export default AffAddWithdraw;

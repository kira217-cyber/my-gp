import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaBell,
  FaCheckCircle,
  FaEdit,
  FaExternalLinkAlt,
  FaPlus,
  FaPowerOff,
  FaSave,
  FaSyncAlt,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";
import { api } from "../../api/axios";

const card =
  "rounded-3xl border border-blue-200/15 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black shadow-2xl shadow-blue-900/30 overflow-hidden";

const inputCls =
  "w-full h-11 rounded-2xl border border-blue-200/15 bg-black/40 px-4 text-white placeholder-blue-100/35 outline-none focus:ring-2 focus:ring-[#63a8ee]/30 focus:border-[#63a8ee] transition";

const textareaCls =
  "w-full min-h-[110px] rounded-2xl border border-blue-200/15 bg-black/40 px-4 py-3 text-white placeholder-blue-100/35 outline-none focus:ring-2 focus:ring-[#63a8ee]/30 focus:border-[#63a8ee] transition resize-y";

const labelCls = "mb-2 block text-sm font-semibold text-blue-100/85";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer";

const btnPrimary = `${btnBase} bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white border border-blue-300/20 shadow-lg shadow-blue-800/20 hover:from-[#7bb7f1] hover:to-[#3b88db]`;

const btnSecondary = `${btnBase} bg-black/35 text-blue-100 border border-blue-200/15 hover:bg-black/55`;

const btnDanger = `${btnBase} bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-400/20 hover:from-red-500 hover:to-rose-500`;

const initialForm = {
  text_bn: "",
  text_en: "",
  linkUrl: "",
  isActive: true,
};

const Toggle = ({ checked, onChange, label }) => (
  <label className="inline-flex cursor-pointer select-none items-center gap-3">
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

const AddNotice = () => {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = !!selectedId;

  const selected = useMemo(
    () => list.find((item) => item._id === selectedId) || null,
    [list, selectedId],
  );

  const stats = useMemo(() => {
    const active = list.filter((x) => x.isActive).length;
    return {
      total: list.length,
      active,
      inactive: list.length - active,
    };
  }, [list]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/admin/notices");
      setList(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selected) return;

    setForm({
      text_bn: selected?.text?.bn || "",
      text_en: selected?.text?.en || "",
      linkUrl: selected?.linkUrl || "",
      isActive: selected?.isActive !== false,
    });
  }, [selected]);

  const setVal = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const clearForm = () => {
    setSelectedId("");
    setForm(initialForm);
  };

  const validate = () => {
    if (!String(form.text_bn || "").trim()) {
      return "Notice Text Bangla is required";
    }

    if (!String(form.text_en || "").trim()) {
      return "Notice Text English is required";
    }

    return null;
  };

  const onSubmit = async () => {
    const error = validate();

    if (error) {
      toast.error(error);
      return;
    }

    const payload = {
      text: {
        bn: String(form.text_bn || "").trim(),
        en: String(form.text_en || "").trim(),
      },
      linkUrl: String(form.linkUrl || "").trim(),
      isActive: !!form.isActive,
    };

    try {
      setSaving(true);

      if (isEdit) {
        await api.put(`/api/admin/notices/${selectedId}`, payload);
        toast.success("Notice updated successfully");
      } else {
        await api.post("/api/admin/notices", payload);
        toast.success("Notice created successfully");
      }

      await fetchData();

      if (!isEdit) {
        clearForm();
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteOne = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this notice?");
    if (!ok) return;

    try {
      setSaving(true);

      await api.delete(`/api/admin/notices/${id}`);

      toast.success("Notice deleted successfully");

      if (selectedId === id) clearForm();

      await fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleOne = async (id) => {
    try {
      setSaving(true);

      await api.patch(`/api/admin/notices/${id}/toggle`);

      toast.success("Notice status updated successfully");
      await fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Status update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className={card}>
          <div className="border-b border-blue-200/10 bg-gradient-to-r from-black/70 via-[#2f79c9]/45 to-black/70 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-300/20 bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-800/20">
                  <FaBell className="text-3xl text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    {isEdit ? "Update Notice" : "Add Notice"}
                  </h1>
                  <p className="mt-1 text-sm text-blue-100/75">
                    Create and manage Bangla/English notice messages for client
                    display.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={clearForm}
                  disabled={saving}
                  className={btnSecondary}
                >
                  <FaPlus />
                  New Notice
                </button>

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={saving}
                  className={btnPrimary}
                >
                  {saving ? <FaSyncAlt className="animate-spin" /> : <FaSave />}
                  {isEdit ? "Update Notice" : "Create Notice"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-blue-200/12 bg-black/25 p-4">
                <div className="text-sm text-blue-100/65">Total Notice</div>
                <div className="mt-1 text-lg font-extrabold text-white">
                  {stats.total}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200/12 bg-black/25 p-4">
                <div className="text-sm text-blue-100/65">Active</div>
                <div className="mt-1 text-lg font-extrabold text-emerald-300">
                  {stats.active}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200/12 bg-black/25 p-4">
                <div className="text-sm text-blue-100/65">Inactive</div>
                <div className="mt-1 text-lg font-extrabold text-red-300">
                  {stats.inactive}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="space-y-5 rounded-3xl border border-blue-200/10 bg-black/25 p-5">
                <h2 className="text-lg font-bold text-[#a8d1fb]">
                  Notice Information
                </h2>

                <div>
                  <label className={labelCls}>Notice Text Bangla</label>
                  <textarea
                    value={form.text_bn}
                    onChange={(e) => setVal("text_bn", e.target.value)}
                    placeholder="বাংলায় নোটিশ লিখুন"
                    className={textareaCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Notice Text English</label>
                  <textarea
                    value={form.text_en}
                    onChange={(e) => setVal("text_en", e.target.value)}
                    placeholder="Write notice in English"
                    className={textareaCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Notice Link URL</label>
                  <input
                    value={form.linkUrl}
                    onChange={(e) => setVal("linkUrl", e.target.value)}
                    placeholder="https://example.com or /promotion"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Notice Status</label>
                  <Toggle
                    checked={!!form.isActive}
                    onChange={(e) => setVal("isActive", e.target.checked)}
                    label={form.isActive ? "Active" : "Inactive"}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-blue-200/10 bg-black/25 p-5">
                <h2 className="text-lg font-bold text-[#a8d1fb]">
                  Live Preview
                </h2>

                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-blue-200/10 bg-black/35 p-4">
                    <div className="text-xs font-bold text-blue-100/45">
                      Bangla
                    </div>
                    <div className="mt-2 text-sm leading-7 text-white">
                      {form.text_bn || "বাংলা নোটিশ এখানে দেখা যাবে..."}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-200/10 bg-black/35 p-4">
                    <div className="text-xs font-bold text-blue-100/45">
                      English
                    </div>
                    <div className="mt-2 text-sm leading-7 text-white">
                      {form.text_en ||
                        "English notice preview will appear here..."}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-200/10 bg-black/35 p-4">
                    <div className="text-xs font-bold text-blue-100/45">
                      Link
                    </div>
                    <div className="mt-2 break-all text-sm text-[#8fc2f5]">
                      {form.linkUrl || "No link added"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-200/10 bg-black/35 p-4">
                    <div className="text-xs font-bold text-blue-100/45">
                      Status
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${
                          form.isActive
                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                            : "border-red-400/20 bg-red-500/10 text-red-300"
                        }`}
                      >
                        {form.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                        {form.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={card}>
          <div className="border-b border-blue-200/10 bg-gradient-to-r from-black/70 via-[#2f79c9]/35 to-black/70 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white">
                  All Notices
                </h2>
                <p className="mt-1 text-sm text-blue-100/70">
                  View, edit, toggle and delete notice messages.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchData}
                disabled={loading}
                className={btnSecondary}
              >
                <FaSyncAlt className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="py-16 text-center text-blue-100/55">
                Loading notices...
              </div>
            ) : list.length === 0 ? (
              <div className="py-16 text-center text-blue-100/45">
                No notice found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {list.map((item) => {
                  const displayText =
                    item?.text?.en || item?.text?.bn || "Untitled notice";

                  return (
                    <div
                      key={item._id}
                      className="rounded-3xl border border-blue-200/10 bg-gradient-to-br from-black/50 to-[#2f79c9]/10 p-5 shadow-lg shadow-blue-900/10"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="line-clamp-2 text-lg font-extrabold text-white">
                            {displayText}
                          </div>
                          <div className="mt-1 text-xs text-blue-100/50">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : "—"}
                          </div>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${
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

                      <div className="mt-4 rounded-2xl border border-blue-200/10 bg-black/25 p-3">
                        <div className="text-[11px] font-bold text-blue-100/45">
                          BN Notice
                        </div>
                        <div className="mt-1 line-clamp-3 text-sm leading-6 text-white">
                          {item?.text?.bn || "—"}
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl border border-blue-200/10 bg-black/25 p-3">
                        <div className="text-[11px] font-bold text-blue-100/45">
                          Link URL
                        </div>
                        <div className="mt-1 break-all text-sm text-[#8fc2f5]">
                          {item?.linkUrl ? (
                            <a
                              href={item.linkUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 hover:underline"
                            >
                              {item.linkUrl}
                              <FaExternalLinkAlt className="text-xs" />
                            </a>
                          ) : (
                            "No link"
                          )}
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
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
                          onClick={() => toggleOne(item._id)}
                          disabled={saving}
                          className={btnSecondary}
                        >
                          <FaPowerOff />
                          Toggle
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteOne(item._id)}
                          disabled={saving}
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
    </div>
  );
};

export default AddNotice;

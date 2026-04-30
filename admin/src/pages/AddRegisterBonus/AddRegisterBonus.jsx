import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaSave,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaPowerOff,
} from "react-icons/fa";
import { api } from "../../api/axios";

const card =
  "rounded-3xl border border-blue-200/15 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black shadow-2xl shadow-blue-900/30 overflow-hidden";

const inputCls =
  "w-full h-11 rounded-2xl border border-blue-200/15 bg-black/40 px-4 text-white placeholder-blue-100/35 outline-none focus:ring-2 focus:ring-[#63a8ee]/30 focus:border-[#63a8ee] transition";

const labelCls = "mb-2 block text-sm font-semibold text-blue-100/85";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer";

const btnPrimary = `${btnBase} bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white border border-blue-300/20 shadow-lg shadow-blue-800/20 hover:from-[#7bb7f1] hover:to-[#3b88db]`;

const btnSecondary = `${btnBase} bg-black/35 text-blue-100 border border-blue-200/15 hover:bg-black/55`;

const btnDanger = `${btnBase} bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-400/20 hover:from-red-500 hover:to-rose-500`;

const money = (v) => {
  const num = Number(v || 0);
  if (!Number.isFinite(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const initialForm = {
  title_bn: "",
  title_en: "",
  amount: "",
  turnoverMultiplier: "",
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

const AddRegisterBonus = () => {
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
    const inactive = list.length - active;
    return { total: list.length, active, inactive };
  }, [list]);

  const currentTurnoverRequired = useMemo(() => {
    const amount = Number(form.amount || 0);
    const multiplier = Number(form.turnoverMultiplier || 0);

    if (!Number.isFinite(amount) || !Number.isFinite(multiplier)) return 0;

    return amount * multiplier;
  }, [form.amount, form.turnoverMultiplier]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/admin/register-bonuses");

      setList(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Failed to load register bonus",
      );
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
      title_bn: selected?.title?.bn || "",
      title_en: selected?.title?.en || "",
      amount: String(selected?.amount ?? ""),
      turnoverMultiplier: String(selected?.turnoverMultiplier ?? ""),
      isActive: selected?.isActive !== false,
    });
  }, [selected]);

  const clearForm = () => {
    setSelectedId("");
    setForm(initialForm);
  };

  const setVal = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const amount = Number(form.amount);
    const turnoverMultiplier = Number(form.turnoverMultiplier);

    if (!Number.isFinite(amount) || amount < 0) {
      return "Bonus amount must be valid";
    }

    if (!Number.isFinite(turnoverMultiplier) || turnoverMultiplier < 0) {
      return "Turnover multiplier must be valid";
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
      title: {
        bn: String(form.title_bn || "").trim(),
        en: String(form.title_en || "").trim(),
      },
      amount: Number(form.amount || 0),
      turnoverMultiplier: Number(form.turnoverMultiplier || 0),
      isActive: !!form.isActive,
    };

    try {
      setSaving(true);

      if (isEdit) {
        await api.put(`/api/admin/register-bonuses/${selectedId}`, payload);
        toast.success("Register bonus updated successfully");
      } else {
        await api.post("/api/admin/register-bonuses", payload);
        toast.success("Register bonus created successfully");
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
    const ok = window.confirm("Are you sure you want to delete this bonus?");
    if (!ok) return;

    try {
      setSaving(true);

      await api.delete(`/api/admin/register-bonuses/${id}`);

      toast.success("Register bonus deleted successfully");

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

      await api.patch(`/api/admin/register-bonuses/${id}/toggle`);

      toast.success("Status updated successfully");
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
                  <FaGift className="text-3xl text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    {isEdit ? "Update Register Bonus" : "Add Register Bonus"}
                  </h1>
                  <p className="mt-1 text-sm text-blue-100/75">
                    Active register bonus will be added to new user balance and
                    turnover will be created automatically.
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
                  New Bonus
                </button>

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={saving}
                  className={btnPrimary}
                >
                  {saving ? <FaSyncAlt className="animate-spin" /> : <FaSave />}
                  {isEdit ? "Update Bonus" : "Create Bonus"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-blue-200/12 bg-black/25 p-4">
                <div className="text-sm text-blue-100/65">Total Bonus</div>
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

              <div className="rounded-2xl border border-blue-200/12 bg-black/25 p-4">
                <div className="text-sm text-blue-100/65">Turnover Preview</div>
                <div className="mt-1 text-lg font-extrabold text-white">
                  {money(currentTurnoverRequired)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="space-y-5 rounded-3xl border border-blue-200/10 bg-black/25 p-5">
                <h2 className="text-lg font-bold text-[#a8d1fb]">
                  Bonus Information
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelCls}>Title BN</label>
                    <input
                      value={form.title_bn}
                      onChange={(e) => setVal("title_bn", e.target.value)}
                      placeholder="যেমন: রেজিস্টার বোনাস"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Title EN</label>
                    <input
                      value={form.title_en}
                      onChange={(e) => setVal("title_en", e.target.value)}
                      placeholder="e.g. Register Bonus"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Bonus Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setVal("amount", e.target.value)}
                    placeholder="100"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Turnover Multiplier</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.turnoverMultiplier}
                    onChange={(e) =>
                      setVal("turnoverMultiplier", e.target.value)
                    }
                    placeholder="5"
                    className={inputCls}
                  />
                  <div className="mt-2 text-xs text-blue-100/55">
                    Example: Bonus {money(form.amount || 0)} ×{" "}
                    {Number(form.turnoverMultiplier || 0)} = Required Turnover{" "}
                    {money(currentTurnoverRequired)}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Status</label>
                  <Toggle
                    checked={!!form.isActive}
                    onChange={(e) => setVal("isActive", e.target.checked)}
                    label={form.isActive ? "Active" : "Inactive"}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-blue-200/10 bg-black/25 p-5">
                <h2 className="text-lg font-bold text-[#a8d1fb]">
                  How It Works
                </h2>

                <div className="mt-4 space-y-4 text-sm leading-7 text-blue-100/75">
                  <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                    1. User successfully register করলে latest active register
                    bonus apply হবে।
                  </div>

                  <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                    2. Bonus amount সরাসরি user balance-এ add হবে।
                  </div>

                  <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                    3. Turnover create হবে:{" "}
                    <span className="font-bold text-white">
                      bonus amount × turnover multiplier
                    </span>
                    .
                  </div>

                  <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                    4. Multiple active bonus থাকলে backend latest active bonus
                    use করবে।
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
                  All Register Bonuses
                </h2>
                <p className="mt-1 text-sm text-blue-100/70">
                  Manage active/inactive register bonus settings.
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
                Loading register bonuses...
              </div>
            ) : list.length === 0 ? (
              <div className="py-16 text-center text-blue-100/45">
                No register bonus found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {list.map((item) => {
                  const displayTitle =
                    item?.title?.en || item?.title?.bn || "Register Bonus";

                  const turnoverRequired =
                    Number(item.amount || 0) *
                    Number(item.turnoverMultiplier || 0);

                  return (
                    <div
                      key={item._id}
                      className="rounded-3xl border border-blue-200/10 bg-gradient-to-br from-black/50 to-[#2f79c9]/10 p-5 shadow-lg shadow-blue-900/10"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-lg font-extrabold text-white">
                            {displayTitle}
                          </div>
                          <div className="mt-1 text-xs text-blue-100/50">
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </div>

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

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-3">
                          <div className="text-[11px] text-blue-100/45">
                            Bonus Amount
                          </div>
                          <div className="mt-1 text-sm font-bold text-white">
                            {money(item.amount)}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-3">
                          <div className="text-[11px] text-blue-100/45">
                            Multiplier
                          </div>
                          <div className="mt-1 text-sm font-bold text-white">
                            x{Number(item.turnoverMultiplier || 0)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl border border-blue-200/10 bg-black/25 p-3">
                        <div className="text-[11px] text-blue-100/45">
                          Required Turnover
                        </div>
                        <div className="mt-1 text-sm font-bold text-white">
                          {money(turnoverRequired)}
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

export default AddRegisterBonus;

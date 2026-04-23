import React, { useEffect, useMemo, useState } from "react";
import { FaTimes, FaWallet, FaSave, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 outline-none focus:ring-2 focus:ring-[#2f79c9]/20";

const btnPrimary =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2f79c9] to-[#63a8ee] px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60";

const btnGhost =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

const btnDanger =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60";

const typeOptions = [
  { value: "personal", label: "Personal", labelBn: "পার্সোনাল" },
  { value: "agent", label: "Agent", labelBn: "এজেন্ট" },
  { value: "merchant", label: "Merchant", labelBn: "মার্চেন্ট" },
];

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};

const EWallateModal = ({
  open,
  onClose,
  method,
  isBangla,
  editingWallet = null,
  onSaved,
  onDeleted,
}) => {
  const [walletType, setWalletType] = useState("personal");
  const [walletNumber, setWalletNumber] = useState("");
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  const methodName = useMemo(() => {
    if (!method) return "";
    return isBangla
      ? method?.name?.bn || method?.name?.en || method?.methodId
      : method?.name?.en || method?.name?.bn || method?.methodId;
  }, [method, isBangla]);

  useEffect(() => {
    let showTimer;
    let hideTimer;

    if (open) {
      setMounted(true);

      showTimer = setTimeout(() => {
        setVisible(true);
      }, 20);
    } else {
      setVisible(false);

      hideTimer = setTimeout(() => {
        setMounted(false);
      }, 320);
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (editingWallet) {
      setWalletType(
        String(editingWallet?.walletType || "personal").toLowerCase(),
      );
      setWalletNumber(editingWallet?.walletNumber || "");
      setLabel(editingWallet?.label || "");
    } else {
      setWalletType("personal");
      setWalletNumber("");
      setLabel("");
    }
  }, [open, editingWallet]);

  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose]);

  if (!mounted) return null;

  const validate = () => {
    if (!method?.methodId) {
      return isBangla ? "মেথড পাওয়া যায়নি" : "Method not found";
    }

    if (!["personal", "agent", "merchant"].includes(walletType)) {
      return isBangla
        ? "সঠিক wallet type নির্বাচন করুন"
        : "Select a valid wallet type";
    }

    if (!walletNumber.trim()) {
      return isBangla ? "ওয়ালেট নাম্বার প্রয়োজন" : "Wallet number is required";
    }

    if (!/^01[3-9]\d{8}$/.test(walletNumber.trim())) {
      return isBangla
        ? "সঠিক বাংলাদেশি নাম্বার দিন"
        : "Enter a valid Bangladeshi wallet number";
    }

    return null;
  };

  const saveNow = async () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        methodId: String(method.methodId || "")
          .trim()
          .toUpperCase(),
        walletType,
        walletNumber: walletNumber.trim(),
        label: label.trim(),
      };

      let res;

      if (editingWallet?._id) {
        res = await api.put(`/api/e-wallets/${editingWallet._id}`, payload);
      } else {
        res = await api.post("/api/e-wallets", payload);
      }

      toast.success(
        res?.data?.message ||
          (editingWallet
            ? isBangla
              ? "ওয়ালেট আপডেট হয়েছে"
              : "Wallet updated successfully"
            : isBangla
              ? "ওয়ালেট যোগ হয়েছে"
              : "Wallet created successfully"),
      );

      onSaved?.(res?.data?.data || null);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteNow = async () => {
    if (!editingWallet?._id) return;

    try {
      setDeleting(true);

      const res = await api.delete(`/api/e-wallets/${editingWallet._id}`);

      toast.success(
        res?.data?.message ||
          (isBangla ? "ওয়ালেট ডিলিট হয়েছে" : "Wallet deleted successfully"),
      );

      onDeleted?.(editingWallet);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-center">
      <div className="relative h-screen w-full max-w-[480px] overflow-hidden">
        <div
          className={`absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />

        <div
          className={`absolute right-0 top-0 h-full w-full max-w-[430px] bg-white shadow-2xl will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            visible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f79c9] to-[#63a8ee] text-white">
                    <FaWallet />
                  </div>

                  <div>
                    <div className="text-[18px] font-extrabold text-slate-900">
                      {editingWallet
                        ? isBangla
                          ? "ই-ওয়ালেট আপডেট"
                          : "Update E-Wallet"
                        : isBangla
                          ? "ই-ওয়ালেট যোগ করুন"
                          : "Add E-Wallet"}
                    </div>
                    <div className="mt-1 text-[12px] text-slate-500">
                      {methodName || "—"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {method?.logoUrl ? (
                      <img
                        src={getImageUrl(method.logoUrl)}
                        alt={methodName}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <div className="text-[12px] font-black text-[#2f79c9]">
                        {String(method?.methodId || "W")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[13px] font-bold text-slate-500">
                      {isBangla ? "নির্বাচিত মেথড" : "Selected Method"}
                    </div>
                    <div className="mt-1 text-[18px] font-extrabold text-slate-900">
                      {methodName}
                    </div>
                    <div className="text-[12px] text-slate-500">
                      {method?.methodId || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-[13px] font-bold text-slate-800">
                    {isBangla ? "ওয়ালেট টাইপ" : "Wallet Type"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={walletType}
                    onChange={(e) => setWalletType(e.target.value)}
                    className={inputCls}
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {isBangla ? opt.labelBn : opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-bold text-slate-800">
                    {isBangla ? "ওয়ালেট নাম্বার" : "Wallet Number"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className={inputCls}
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-bold text-slate-800">
                    {isBangla ? "লেবেল (ঐচ্ছিক)" : "Label (Optional)"}
                  </label>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={
                      isBangla
                        ? "যেমন: আমার পার্সোনাল"
                        : "e.g. My Personal Wallet"
                    }
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={saveNow}
                  disabled={submitting || deleting}
                  className={btnPrimary}
                >
                  <FaSave />
                  {submitting
                    ? isBangla
                      ? "সেভ হচ্ছে..."
                      : "Saving..."
                    : editingWallet
                      ? isBangla
                        ? "আপডেট করুন"
                        : "Update Wallet"
                      : isBangla
                        ? "ওয়ালেট যোগ করুন"
                        : "Add Wallet"}
                </button>

                {editingWallet?._id && (
                  <button
                    type="button"
                    onClick={deleteNow}
                    disabled={submitting || deleting}
                    className={btnDanger}
                  >
                    <FaTrash />
                    {deleting
                      ? isBangla
                        ? "ডিলিট হচ্ছে..."
                        : "Deleting..."
                      : isBangla
                        ? "ওয়ালেট ডিলিট করুন"
                        : "Delete Wallet"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting || deleting}
                  className={btnGhost}
                >
                  {isBangla ? "বন্ধ করুন" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EWallateModal;

import React, { useEffect, useMemo, useState } from "react";
import { FaRegCopy, FaChevronRight, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(r).padStart(2, "0");
  return `${mm}:${ss}`;
};

const safeCopy = async (text) => {
  try {
    await navigator.clipboard.writeText(String(text || ""));
    return true;
  } catch {
    return false;
  }
};

const money = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const FallbackLogo = ({ methodId }) => (
  <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full border border-[#2f79c9] bg-[#eaf3fd]">
    <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full border border-[#2f79c9]">
      <div className="text-center text-[12px] font-extrabold text-[#2f79c9]">
        {(methodId || "PAY").toUpperCase()}
      </div>
    </div>
  </div>
);

const InputRow = ({
  label,
  value,
  onChange,
  placeholder,
  copyable = false,
  onCopy,
  disabled = false,
  type = "text",
}) => (
  <div className="mt-3">
    <div className="text-[13px] font-semibold text-slate-800">{label}</div>
    <div className="relative mt-1">
      <input
        value={value}
        onChange={onChange}
        disabled={disabled}
        type={type}
        placeholder={placeholder}
        className={`h-[42px] w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-[14px] outline-none focus:ring-2 focus:ring-[#2f79c9]/20 ${
          disabled ? "cursor-not-allowed text-slate-500" : "text-slate-900"
        }`}
      />
      {copyable ? (
        <button
          type="button"
          onClick={onCopy}
          className="absolute right-2 top-1/2 flex h-[28px] w-[28px] -translate-y-1/2 items-center justify-center rounded-md bg-gradient-to-r from-[#2f79c9] to-[#63a8ee] text-white shadow-lg cursor-pointer"
          title="Copy"
        >
          <FaRegCopy className="text-[14px]" />
        </button>
      ) : null}
    </div>
  </div>
);

const DepositModal = ({
  open,
  onClose,
  data,
  details,
  methodDoc,
  channelDoc,
  contactDoc,
}) => {
  const { language, isBangla } = useLanguage();
  const apiBase = import.meta.env.VITE_API_URL || "";
  const methodId = data?.methodId || methodDoc?.methodId || "pay";
  const navigate = useNavigate();

  const t = {
    timeLeft: isBangla ? "বাকি সময়" : "Time left",
    amount: isBangla ? "পরিমাণ (৳)" : "Amount (৳)",
    depositNumber: isBangla ? "ডিপোজিট নাম্বার" : "Deposit Number",
    notSet: isBangla ? "সেট করা নেই" : "Not set",
    submit: isBangla ? "সাবমিট" : "Submit",
    submitting: isBangla ? "সাবমিট হচ্ছে..." : "Submitting...",
    howToDeposit: isBangla ? "কীভাবে ডিপোজিট করবেন?" : "How to deposit?",
    securePlace: isBangla
      ? "আপনি একটি নিরাপদ জায়গায় আছেন।"
      : "You’re in a secure place.",
    copied: isBangla ? "কপি হয়েছে" : "Copied",
    copyFailed: isBangla ? "কপি ব্যর্থ হয়েছে" : "Copy failed",
    submitted: isBangla
      ? "ডিপোজিট রিকোয়েস্ট সাবমিট হয়েছে!"
      : "Deposit request submitted!",
    requestFailed: isBangla
      ? "ডিপোজিট রিকোয়েস্ট ব্যর্থ হয়েছে"
      : "Deposit request failed",
    somethingWrong: isBangla ? "কিছু একটা ভুল হয়েছে" : "Something went wrong",
    defaultInstruction: isBangla
      ? "নিচের নাম্বারে টাকা পাঠান এবং সঠিক ট্রানজেকশন আইডি দিন।"
      : "Transfer to the number shown below and provide the correct transaction ID.",
    chooseApp: isBangla
      ? "আপনার পেমেন্ট অ্যাপ নির্বাচন করুন"
      : "Choose your payment app",
    sendMoney: isBangla
      ? "নির্বাচিত নাম্বারে টাকা পাঠান"
      : "Send money to the selected number",
    copyTrx: isBangla ? "ট্রানজেকশন আইডি কপি করুন" : "Copy the transaction ID",
    fillFields: isBangla
      ? "সব প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন"
      : "Fill all required fields correctly",
    submitRequest: isBangla
      ? "তারপর রিকোয়েস্ট সাবমিট করুন"
      : "Submit the request",
  };

  const logoUrl = useMemo(() => {
    const u = methodDoc?.logoUrl;
    return u ? `${apiBase}${u}` : "";
  }, [apiBase, methodDoc?.logoUrl]);

  const inputDefs = useMemo(() => {
    const arr = methodDoc?.inputs;
    return Array.isArray(arr) ? arr : [];
  }, [methodDoc]);

  const instructions = useMemo(() => {
    return (
      (language === "Bangla"
        ? methodDoc?.instructions?.bn || methodDoc?.instructions?.en
        : methodDoc?.instructions?.en || methodDoc?.instructions?.bn) ||
      t.defaultInstruction
    );
  }, [methodDoc, language, t.defaultInstruction]);

  const hasAmountField = useMemo(
    () => inputDefs.some((def) => def?.key === "amount"),
    [inputDefs],
  );

  const contactLabel = useMemo(() => {
    return (
      (language === "Bangla"
        ? contactDoc?.label?.bn ||
          contactDoc?.label?.en ||
          channelDoc?.name?.bn ||
          channelDoc?.name?.en
        : contactDoc?.label?.en ||
          contactDoc?.label?.bn ||
          channelDoc?.name?.en ||
          channelDoc?.name?.bn) || t.depositNumber
    );
  }, [contactDoc, channelDoc, language, t.depositNumber]);

  const contactNumber = useMemo(() => {
    return String(contactDoc?.number || "").trim();
  }, [contactDoc]);

  const displayMethodName = useMemo(() => {
    return (
      (language === "Bangla"
        ? methodDoc?.methodName?.bn || methodDoc?.methodName?.en
        : methodDoc?.methodName?.en || methodDoc?.methodName?.bn) || methodId
    );
  }, [methodDoc, methodId, language]);

  const [values, setValues] = useState({});
  const [seconds, setSeconds] = useState(0);
  const [howOpen, setHowOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setSeconds(15 * 60);
    setHowOpen(false);
    setSubmitting(false);

    const initial = {};

    if (inputDefs.length) {
      for (const f of inputDefs) {
        if (!f?.key) continue;
        if (f.key === "amount") {
          initial[f.key] = String(data?.amount ?? "");
        } else {
          initial[f.key] = "";
        }
      }
    } else {
      initial.senderNumber = "";
      initial.trxId = "";
    }

    setValues(initial);

    const id = setInterval(() => {
      setSeconds((p) => (p > 0 ? p - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, [open, inputDefs, data?.amount]);

  const setField = (key, val) => setValues((p) => ({ ...p, [key]: val }));

  const validateField = (def, val) => {
    const v = String(val ?? "").trim();

    if (def?.required && !v) return false;
    if (def?.minLength && v.length < def.minLength) return false;
    if (def?.maxLength && v.length > def.maxLength) return false;

    if (def?.key === "amount") {
      const amt = Number(v || 0);
      if (!Number.isFinite(amt) || amt <= 0) return false;
    }

    return true;
  };

  const canSubmit = useMemo(() => {
    if (seconds <= 0) return false;

    if (inputDefs.length) {
      for (const def of inputDefs) {
        if (!validateField(def, values[def.key])) return false;
      }
      return true;
    }

    return (
      String(values.senderNumber || "").trim().length >= 8 &&
      String(values.trxId || "").trim().length >= 6
    );
  }, [seconds, inputDefs, values]);

  const handleCopy = async (txt) => {
    const ok = await safeCopy(txt);
    if (ok) toast.success(t.copied);
    else toast.error(t.copyFailed);
  };

  const buildPayload = () => {
    const submittedFields = {};

    Object.keys(values || {}).forEach((k) => {
      submittedFields[k] =
        k === "amount"
          ? String(data?.amount ?? values[k] ?? "")
          : String(values[k] ?? "");
    });

    if (!("amount" in submittedFields)) {
      submittedFields.amount = String(data?.amount ?? 0);
    }

    return {
      methodId: data?.methodId,
      channelId: data?.channelId,
      promoId: data?.promoId || "none",
      amount: Number(data?.amount ?? 0) || 0,
      fields: submittedFields,
      display: {
        methodName: methodDoc?.methodName,
        channelName: channelDoc?.name || {},
        contactLabel: contactDoc?.label || {},
        channelTagText: channelDoc?.tagText || "",
        channelNumber: contactNumber || "",
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      const payload = buildPayload();

      const res = await api.post("/api/deposit-requests", payload);

      if (res?.data?.success) {
        toast.success(t.submitted);
        onClose?.();
        navigate("/deposit");
      } else {
        toast.error(res?.data?.message || t.requestFailed);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || t.somethingWrong;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 bg-white/20">
        <div className="flex h-full w-full items-center justify-center px-4 py-8">
          <div className="h-[620px] w-full max-w-[480px] overflow-y-auto [scrollbar-width:none] rounded-2xl border border-[#2f79c9]/20 bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={methodId}
                      className="h-[64px] w-[64px] bg-white object-contain p-2"
                    />
                  ) : (
                    <FallbackLogo methodId={methodId} />
                  )}

                  <div>
                    <div className="text-[18px] font-extrabold text-slate-900">
                      {displayMethodName}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[14px] font-extrabold text-slate-900">
                    {t.timeLeft}{" "}
                    <span className="text-red-500">{formatTime(seconds)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center text-[12px] leading-relaxed text-slate-500">
                {instructions}
              </div>

              <div className="mt-4 h-px bg-slate-200" />

              <form onSubmit={handleSubmit} className="mt-3">
                {!hasAmountField && (
                  <InputRow
                    label={t.amount}
                    value={money(data?.amount || 0)}
                    onChange={() => {}}
                    placeholder=""
                    disabled
                  />
                )}

                <InputRow
                  label={contactLabel}
                  value={contactNumber || t.notSet}
                  onChange={() => {}}
                  placeholder=""
                  disabled
                  copyable={!!contactNumber}
                  onCopy={() => handleCopy(contactNumber)}
                />

                {inputDefs.length ? (
                  inputDefs.map((def) => {
                    const label =
                      (language === "Bangla"
                        ? def?.label?.bn || def?.label?.en
                        : def?.label?.en || def?.label?.bn) ||
                      def?.key ||
                      "";

                    const placeholder =
                      (language === "Bangla"
                        ? def?.placeholder?.bn || def?.placeholder?.en
                        : def?.placeholder?.en || def?.placeholder?.bn) || "";

                    return (
                      <InputRow
                        key={def.key}
                        label={`${label}${def.required ? " *" : ""}`}
                        value={
                          def.key === "amount"
                            ? (values[def.key] ?? String(data?.amount ?? ""))
                            : (values[def.key] ?? "")
                        }
                        onChange={(e) => {
                          if (def.key === "amount") return;
                          setField(def.key, e.target.value);
                        }}
                        placeholder={placeholder}
                        type={def.type || "text"}
                        disabled={def.key === "amount"}
                        copyable={false}
                      />
                    );
                  })
                ) : (
                  <>
                    <InputRow
                      label={
                        isBangla ? "প্রেরকের নাম্বার *" : "Sender number *"
                      }
                      value={values.senderNumber || ""}
                      onChange={(e) => setField("senderNumber", e.target.value)}
                      placeholder="01XXXXXXXXX"
                      type="tel"
                    />

                    <InputRow
                      label={
                        isBangla ? "ট্রানজেকশন আইডি *" : "Transaction ID *"
                      }
                      value={values.trxId || ""}
                      onChange={(e) => setField("trxId", e.target.value)}
                      placeholder="e.g. 9A7B6C5D"
                    />
                  </>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className={`mt-4 h-[46px] w-full rounded-xl text-[15px] font-extrabold transition ${
                    canSubmit && !submitting
                      ? "cursor-pointer bg-gradient-to-r from-[#2f79c9] to-[#63a8ee] text-white hover:opacity-95"
                      : "cursor-not-allowed bg-slate-200 text-slate-400"
                  }`}
                >
                  {submitting ? t.submitting : t.submit}
                </button>

                <button
                  type="button"
                  onClick={() => setHowOpen((p) => !p)}
                  className="mt-4 flex h-[44px] w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3"
                >
                  <div className="flex items-center gap-2 text-[14px] font-extrabold text-slate-900">
                    <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded border border-slate-300">
                      <FaChevronRight
                        className={`text-[12px] transition ${
                          howOpen ? "rotate-90" : ""
                        }`}
                      />
                    </span>
                    {t.howToDeposit}
                  </div>
                </button>

                {howOpen && (
                  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[12px] leading-relaxed text-slate-600">
                    <ol className="list-decimal space-y-1 pl-5">
                      <li>{t.chooseApp}</li>
                      <li>{t.sendMoney}</li>
                      <li>{t.copyTrx}</li>
                      <li>{t.fillFields}</li>
                      <li>{t.submitRequest}</li>
                    </ol>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-slate-500">
                  <FaLock className="text-[12px]" />
                  <span>{t.securePlace}</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full bg-white shadow sm:right-184 sm:top-22"
        aria-label="Close"
      >
        <span className="text-[20px] leading-none text-slate-700">
          <IoMdClose />
        </span>
      </button>
    </div>
  );
};

export default DepositModal;

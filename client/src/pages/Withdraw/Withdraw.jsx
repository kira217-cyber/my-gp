import React, { useEffect, useMemo, useState } from "react";
import {
  FaExclamationCircle,
  FaQuestionCircle,
  FaWallet,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { api } from "../../api/axios";
import {
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";
import { useLanguage } from "../../Context/LanguageProvider";

const OptionLogo = ({ type }) => {
  const base = "w-10 h-10 rounded-full flex items-center justify-center";
  return (
    <div className={`${base} bg-[#eaf3fd]`}>
      <span className="font-extrabold text-[#2f79c9] text-[13px]">
        {(type || "W").slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
};

const money = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const beautifyKey = (key = "") =>
  String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (m) => m.toUpperCase());

const Withdraw = () => {
  const navigate = useNavigate();
  const { language, isBangla } = useLanguage();

  const user = useSelector(selectUser);
  const isAuthed = useSelector(selectIsAuthenticated);
  const isActiveUser = user?.isActive === true;

  const t = {
    withdraw: isBangla ? "উইথড্র" : "Withdrawal",
    withdrawOptions: isBangla ? "উইথড্র অপশন" : "Withdrawal Options",
    accountInformation: isBangla ? "একাউন্ট তথ্য" : "Account Information",
    withdrawAmount: isBangla ? "উইথড্র পরিমাণ" : "Withdraw Amount",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    noWithdrawMethods: isBangla
      ? "কোনো উইথড্র মেথড পাওয়া যায়নি।"
      : "No withdraw methods found.",
    loginRequired: isBangla ? "লগইন প্রয়োজন" : "Login Required",
    loginToWithdraw: isBangla
      ? "উইথড্র করতে লগইন করুন।"
      : "Please login to submit a withdraw request.",
    accountInactive: isBangla ? "একাউন্ট নিষ্ক্রিয়" : "Account Inactive",
    inactiveContactSupport: isBangla
      ? "আপনার একাউন্ট inactive. সাপোর্টে যোগাযোগ করুন।"
      : "Your account is inactive. Please contact support.",
    withdrawNotAllowed: isBangla
      ? "উইথড্র করা যাচ্ছে না"
      : "Withdrawal Not Allowed",
    turnoverBlocked: isBangla
      ? "আপনার running turnover আছে। আগে সেটা complete করুন।"
      : "You have an active turnover. Complete it first.",
    checkingTurnover: isBangla
      ? "টার্নওভার চেক করা হচ্ছে..."
      : "Checking turnover...",
    selected: isBangla ? "নির্বাচিত" : "Selected",
    minimum: isBangla ? "সর্বনিম্ন" : "Minimum",
    maximum: isBangla ? "সর্বোচ্চ" : "Maximum",
    enterWithdrawAmount: isBangla
      ? "উইথড্র পরিমাণ লিখুন"
      : "Enter withdraw amount",
    currentBalance: isBangla ? "বর্তমান ব্যালেন্স" : "Current Balance",
    submitWithdraw: isBangla ? "উইথড্র করুন" : "WITHDRAWAL",
    submitting: isBangla ? "সাবমিট হচ্ছে..." : "Submitting...",
    pleaseSelectMethod: isBangla
      ? "একটি উইথড্র মেথড নির্বাচন করুন"
      : "Please select a withdraw method",
    validAmount: isBangla ? "সঠিক পরিমাণ লিখুন" : "Please enter a valid amount",
    minimumWithdrawMustBe: isBangla
      ? "সর্বনিম্ন উইথড্র হতে হবে"
      : "Minimum withdraw amount is",
    maximumWithdrawIs: isBangla
      ? "সর্বোচ্চ উইথড্র হলো"
      : "Maximum withdraw amount is",
    fillRequiredFields: isBangla
      ? "সব required field পূরণ করুন"
      : "Fill all required fields.",
    invalidInputs: isBangla ? "কিছু input সঠিক নয়" : "Some inputs are invalid.",
    amountInvalid: isBangla ? "Amount সঠিক নয়" : "Amount is invalid.",
    remainingTurnover: isBangla ? "বাকি টার্নওভার" : "Remaining turnover",
    thisFieldRequired: isBangla
      ? "এই ফিল্ডটি প্রয়োজন"
      : "This field is required",
    validEmail: isBangla ? "সঠিক email দিন" : "Enter a valid email",
    validPhone: isBangla
      ? "সঠিক বাংলাদেশি নাম্বার দিন"
      : "Enter a valid Bangladeshi phone number",
    numberOnly: isBangla ? "শুধু সংখ্যা দিন" : "Numbers only",
    successSubmit: isBangla
      ? "Withdraw request submitted!"
      : "Withdraw request submitted!",
    importantInfo: isBangla ? "গুরুত্বপূর্ণ তথ্য" : "Important Information",
  };

  const notices = useMemo(
    () => [
      {
        title: isBangla
          ? "শুধু অফিসিয়াল উইথড্র মেথড ব্যবহার করুন"
          : "Use Official Withdrawal Channels Only",
        body: isBangla
          ? "শুধু ওয়েবসাইটে দেখানো official withdraw method ব্যবহার করুন।"
          : "Use only the official withdrawal channels available on the site.",
      },
      {
        title: isBangla
          ? "সঠিক একাউন্ট তথ্য দিন"
          : "Provide Correct Account Details",
        body: isBangla
          ? "ভুল account number / wallet number দিলে withdraw delay হতে পারে।"
          : "Incorrect account or wallet details may delay the withdrawal.",
      },
      {
        title: isBangla
          ? "পেন্ডিং হলে সাপোর্টে যোগাযোগ করুন"
          : "Contact Support if Pending",
        body: isBangla
          ? "withdraw request অনেকক্ষণ pending থাকলে support এ যোগাযোগ করুন।"
          : "If the withdrawal remains pending for a long time, contact support.",
      },
      {
        title: isBangla ? "টার্নওভার রুল প্রযোজ্য" : "Turnover Rule Applies",
        body: isBangla
          ? "running turnover থাকলে withdraw block থাকবে।"
          : "Withdrawal remains blocked until the active turnover is completed.",
      },
    ],
    [isBangla],
  );

  const [loadingMethods, setLoadingMethods] = useState(false);
  const [methods, setMethods] = useState([]);

  const loadMethods = async () => {
    try {
      setLoadingMethods(true);
      const res = await api.get("/api/withdraw-methods");
      const rows = res?.data?.data || [];
      setMethods(
        Array.isArray(rows) ? rows.filter((m) => m?.isActive !== false) : [],
      );
    } catch (e) {
      setMethods([]);
      console.error("Failed to load withdraw methods", e);
    } finally {
      setLoadingMethods(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const [eligLoading, setEligLoading] = useState(false);
  const [elig, setElig] = useState({
    eligible: true,
    hasRunningTurnover: false,
    remaining: 0,
    message: "",
  });

  const loadEligibility = async () => {
    if (!isAuthed) {
      setElig({
        eligible: false,
        hasRunningTurnover: false,
        remaining: 0,
        message: "Please login to withdraw.",
      });
      return;
    }

    try {
      setEligLoading(true);
      const { data } = await api.get("/api/withdraw-requests/eligibility");
      const payload = data?.data || {};
      setElig({
        eligible: !!payload.eligible,
        hasRunningTurnover: !!payload.hasRunningTurnover,
        remaining: Number(payload.remaining || 0),
        message: payload.message || "",
      });
    } catch (e) {
      setElig((p) => ({ ...p, eligible: true }));
    } finally {
      setEligLoading(false);
    }
  };

  useEffect(() => {
    loadEligibility();
  }, [isAuthed]);

  const [selectedId, setSelectedId] = useState("");

  const selectedMethod = useMemo(() => {
    if (!methods.length) return null;
    return (
      methods.find((m) => String(m.methodId) === String(selectedId)) || null
    );
  }, [methods, selectedId]);

  useEffect(() => {
    if (!selectedId && methods.length) {
      setSelectedId(methods[0]?.methodId || "");
    }
  }, [methods, selectedId]);

  // ✅ amount field dynamic fields থেকে বাদ
  const visibleFields = useMemo(() => {
    const fields = Array.isArray(selectedMethod?.fields)
      ? selectedMethod.fields
      : [];
    return fields.filter(
      (f) =>
        String(f?.key || "")
          .trim()
          .toLowerCase() !== "amount",
    );
  }, [selectedMethod]);

  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    if (!selectedMethod) return;

    const next = {};
    visibleFields.forEach((f) => {
      next[f.key] = "";
    });
    setFormValues(next);
  }, [selectedMethod?._id, visibleFields]);

  const setVal = (key, value) => {
    setFormValues((p) => ({ ...p, [key]: value }));
  };

  const [amount, setAmount] = useState("");

  const min = useMemo(() => {
    const v = Number(selectedMethod?.minimumWithdrawAmount ?? 500);
    return Number.isFinite(v) && v >= 0 ? v : 500;
  }, [selectedMethod]);

  const max = useMemo(() => {
    const v = Number(selectedMethod?.maximumWithdrawAmount ?? 30000);
    return Number.isFinite(v) && v >= 0 ? v : 30000;
  }, [selectedMethod]);

  const quickAmounts = useMemo(() => [500, 1000, 2000, 5000, 10000, 20000], []);

  const amountNum = Number(amount || 0);
  const hasMax = Number(max) > 0;
  const amountHasValue = amountNum > 0;

  const validAmount = useMemo(() => {
    if (!Number.isFinite(amountNum)) return false;
    if (amountNum < Number(min)) return false;
    if (hasMax && amountNum > Number(max)) return false;
    return true;
  }, [amountNum, min, max, hasMax]);

  const amountErrorText = useMemo(() => {
    if (!amount) return "";
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return t.validAmount;
    }
    if (amountNum < Number(min)) {
      return `${t.minimumWithdrawMustBe} ${money(min)}.`;
    }
    if (hasMax && amountNum > Number(max)) {
      return `${t.maximumWithdrawIs} ${money(max)}.`;
    }
    return "";
  }, [
    amount,
    amountNum,
    min,
    max,
    hasMax,
    t.validAmount,
    t.minimumWithdrawMustBe,
    t.maximumWithdrawIs,
  ]);

  const fieldErrors = useMemo(() => {
    const errs = {};

    visibleFields.forEach((f) => {
      const v = String(formValues?.[f.key] ?? "").trim();

      if (f.required !== false && !v) {
        errs[f.key] = t.thisFieldRequired;
        return;
      }

      if (v) {
        if (f.type === "email") {
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          if (!ok) errs[f.key] = t.validEmail;
        }

        if (f.type === "tel") {
          const bdOk = /^01[3-9]\d{8}$/.test(v);
          if (v.startsWith("01") && v.length >= 11 && !bdOk) {
            errs[f.key] = t.validPhone;
          }
        }

        if (f.type === "number") {
          const n = Number(v);
          if (!Number.isFinite(n)) errs[f.key] = t.numberOnly;
        }
      }
    });

    return errs;
  }, [
    visibleFields,
    formValues,
    t.thisFieldRequired,
    t.validEmail,
    t.validPhone,
    t.numberOnly,
  ]);

  const allRequiredOk = useMemo(() => {
    for (const f of visibleFields) {
      if (f.required !== false) {
        const v = String(formValues?.[f.key] ?? "").trim();
        if (!v) return false;
      }
    }
    return true;
  }, [visibleFields, formValues]);

  const noTypeErrors = Object.keys(fieldErrors).length === 0;
  const accountOk = isAuthed && isActiveUser;

  const canSubmit =
    accountOk &&
    !!selectedMethod &&
    validAmount &&
    allRequiredOk &&
    noTypeErrors &&
    elig.eligible;

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!selectedMethod) {
      toast.error(t.pleaseSelectMethod);
      return;
    }

    if (!validAmount) {
      toast.error(amountErrorText || t.validAmount);
      return;
    }

    if (!allRequiredOk) {
      toast.error(t.fillRequiredFields);
      return;
    }

    if (!noTypeErrors) {
      toast.error(t.invalidInputs);
      return;
    }

    if (!canSubmit || submitting) return;

    const cleanFields = { ...formValues };
    delete cleanFields.amount;

    const payload = {
      methodId: String(selectedMethod?.methodId || "").trim(),
      amount: Number(amount),
      fields: cleanFields,
    };

    console.log("WITHDRAW PAYLOAD:", payload);

    try {
      setSubmitting(true);

      await api.post("/api/withdraw-requests", payload);

      toast.success(t.successSubmit);
      setAmount("");

      const next = {};
      visibleFields.forEach((f) => {
        next[f.key] = "";
      });
      setFormValues(next);

      loadEligibility();
      navigate("/withdraw");
    } catch (e) {
      console.error("WITHDRAW ERROR:", e?.response?.data || e);
      toast.error(e?.response?.data?.message || "Withdraw request failed");
      loadEligibility();
    } finally {
      setSubmitting(false);
    }
  };

  const apiBase = import.meta.env.VITE_API_URL || "";

  return (
    <div className="mb-28 w-full bg-white text-slate-900">
      <div className="grid grid-cols-1 gap-4">
        <div className="border border-[#2f79c9]/20 bg-white p-5 shadow-lg sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f79c9] to-[#63a8ee] text-white shadow-lg">
              <FaWallet className="text-xl" />
            </div>
            <div className="text-[20px] font-extrabold text-slate-900">
              {t.withdraw}
            </div>
          </div>

          {!isAuthed && (
            <div className="mt-5 rounded-xl border border-yellow-300/50 bg-yellow-50 p-4">
              <div className="text-[14px] font-extrabold text-yellow-700">
                {t.loginRequired}
              </div>
              <div className="mt-1 text-[13px] text-yellow-700/90">
                {t.loginToWithdraw}
              </div>
            </div>
          )}

          {isAuthed && !isActiveUser && (
            <div className="mt-5 rounded-xl border border-red-300/50 bg-red-50 p-4">
              <div className="text-[14px] font-extrabold text-red-600">
                {t.accountInactive}
              </div>
              <div className="mt-1 text-[13px] text-red-600/90">
                {t.inactiveContactSupport}
              </div>
            </div>
          )}

          {isAuthed && !eligLoading && !elig.eligible && (
            <div className="mt-5 rounded-xl border border-red-300/50 bg-red-50 p-4">
              <div className="text-[14px] font-extrabold text-red-600">
                {t.withdrawNotAllowed}
              </div>
              <div className="mt-1 text-[13px] text-red-600/90">
                {elig.message || t.turnoverBlocked}
              </div>
              {elig.remaining > 0 && (
                <div className="mt-2 text-[13px] font-bold text-red-600">
                  {t.remainingTurnover}: ৳ {elig.remaining.toLocaleString()}
                </div>
              )}
            </div>
          )}

          {isAuthed && eligLoading && (
            <div className="mt-4 text-[12px] text-slate-500">
              {t.checkingTurnover}
            </div>
          )}

          <div className="mt-5">
            <label className="text-[14px] font-semibold text-slate-900">
              {t.withdrawOptions} <span className="text-red-500">*</span>
            </label>

            {loadingMethods ? (
              <div className="mt-3 text-[13px] text-slate-500">{t.loading}</div>
            ) : methods.length ? (
              <div className="mt-3 flex flex-wrap gap-3">
                {methods.map((m) => {
                  const active = String(selectedId) === String(m.methodId);
                  const displayMethodName =
                    language === "Bangla"
                      ? m?.name?.bn || m?.name?.en || m?.methodId
                      : m?.name?.en || m?.name?.bn || m?.methodId;

                  return (
                    <button
                      key={m._id || m.methodId}
                      type="button"
                      onClick={() => setSelectedId(m.methodId)}
                      disabled={!accountOk}
                      className={`flex h-[60px] w-[100px] items-center justify-center rounded-xl border-2 bg-white transition ${
                        active
                          ? "cursor-pointer border-[#2f79c9] shadow-lg"
                          : "cursor-pointer border-slate-200 hover:border-[#2f79c9]/60"
                      } ${!accountOk ? "cursor-not-allowed opacity-60" : ""}`}
                      title={displayMethodName}
                    >
                      {m.logoUrl ? (
                        <img
                          src={`${apiBase}${m.logoUrl}`}
                          alt={displayMethodName}
                          className="max-h-[32px] max-w-[80px] object-contain"
                        />
                      ) : (
                        <OptionLogo type={m.methodId} />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 text-[13px] text-slate-500">
                {t.noWithdrawMethods}
              </div>
            )}

            {!!selectedMethod && (
              <div className="mt-3 text-[12px] text-slate-500">
                {t.selected}:{" "}
                <span className="font-bold text-slate-900">
                  {language === "Bangla"
                    ? selectedMethod?.name?.bn ||
                      selectedMethod?.name?.en ||
                      selectedMethod?.methodId
                    : selectedMethod?.name?.en ||
                      selectedMethod?.name?.bn ||
                      selectedMethod?.methodId}
                </span>
              </div>
            )}
          </div>

          {!!visibleFields.length && (
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <label className="text-[14px] font-semibold text-slate-900">
                  {t.accountInformation} <span className="text-red-500">*</span>
                </label>
                <FaExclamationCircle className="text-[#2f79c9]" />
              </div>

              <div className="mt-3 max-w-[520px] space-y-4">
                {visibleFields.map((f) => {
                  const label =
                    language === "Bangla"
                      ? f?.label?.bn || f?.label?.en || beautifyKey(f.key)
                      : f?.label?.en || f?.label?.bn || beautifyKey(f.key);

                  const placeholder =
                    language === "Bangla"
                      ? f?.placeholder?.bn || f?.placeholder?.en || ""
                      : f?.placeholder?.en || f?.placeholder?.bn || "";

                  const err = fieldErrors?.[f.key];

                  return (
                    <div key={f.key}>
                      <label className="text-[14px] font-semibold text-slate-900">
                        {label}{" "}
                        {f.required !== false && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>

                      <input
                        disabled={!accountOk}
                        type={f.type === "number" ? "text" : f.type}
                        value={formValues?.[f.key] ?? ""}
                        onChange={(e) => setVal(f.key, e.target.value)}
                        placeholder={placeholder}
                        className={`mt-3 w-full rounded-xl border px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-[#2f79c9]/20 ${
                          err
                            ? "border-red-400 bg-red-50 text-slate-900"
                            : "border-slate-200 bg-white text-slate-900"
                        } ${!accountOk ? "cursor-not-allowed opacity-60" : ""}`}
                        inputMode={f.type === "number" ? "numeric" : undefined}
                      />

                      {!!err && (
                        <div className="mt-2 text-[12px] font-semibold text-red-500">
                          {err}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <label className="text-[14px] font-semibold text-slate-900">
                {t.withdrawAmount} <span className="text-red-500">*</span>
              </label>
              <FaQuestionCircle className="text-slate-500" />
            </div>

            <div className="mt-3">
              <input
                disabled={!accountOk}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t.enterWithdrawAmount}
                className={`w-full max-w-[520px] rounded-xl border px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-[#2f79c9]/20 ${
                  amountHasValue && !validAmount
                    ? "border-red-400 bg-red-50"
                    : "border-slate-200 bg-white"
                } ${!accountOk ? "cursor-not-allowed opacity-60" : ""}`}
                inputMode="numeric"
              />
            </div>

            {(min > 0 || max > 0) && (
              <div className="mt-2 text-[12px] text-slate-500">
                {min > 0 ? `${t.minimum}: ${money(min)}` : ""}
                {min > 0 && max > 0 ? " — " : ""}
                {max > 0 ? `${t.maximum}: ${money(max)}` : ""}
              </div>
            )}

            <div className="mt-2 text-[12px] text-slate-500">
              {t.currentBalance}: {money(user?.balance || 0)}
            </div>

            {amountErrorText && (
              <div className="mt-2 text-[12px] font-semibold text-red-500">
                {amountErrorText}
              </div>
            )}

            <div className="mt-5 grid max-w-[720px] grid-cols-3 gap-4">
              {quickAmounts.map((v) => {
                const active = String(v) === String(amount);
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    className={`relative h-[44px] rounded-xl text-[15px] font-extrabold transition ${
                      active
                        ? "cursor-pointer bg-gradient-to-r from-[#2f79c9] to-[#63a8ee] text-white"
                        : "cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 max-w-[520px]">
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit || submitting}
              className={`h-[46px] w-full rounded-xl text-[14px] font-extrabold transition ${
                canSubmit && !submitting
                  ? "cursor-pointer bg-gradient-to-r from-[#2f79c9] to-[#63a8ee] text-white shadow-lg hover:opacity-95"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              }`}
            >
              {submitting ? t.submitting : t.submitWithdraw}
            </button>

            {!canSubmit && !submitting && (
              <div className="mt-2 text-[12px] text-slate-500">
                {!isAuthed
                  ? t.loginToWithdraw
                  : !isActiveUser
                    ? t.inactiveContactSupport
                    : !elig.eligible
                      ? t.turnoverBlocked
                      : !selectedMethod
                        ? t.pleaseSelectMethod
                        : !allRequiredOk
                          ? t.fillRequiredFields
                          : !noTypeErrors
                            ? t.invalidInputs
                            : !validAmount
                              ? t.amountInvalid
                              : null}
              </div>
            )}
          </div>
        </div>

        <div className="border border-[#2f79c9]/10 bg-[#f8fbff] p-4 shadow-sm">
          <div className="text-[14px] font-extrabold text-slate-900">
            {t.importantInfo}
          </div>
          <div className="mt-3 space-y-4 text-[12px] leading-relaxed text-slate-600">
            {notices.map((n, idx) => (
              <div key={idx}>
                <div className="font-extrabold text-slate-900">
                  {idx + 1}. {n.title}
                </div>
                <p className="mt-1">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;

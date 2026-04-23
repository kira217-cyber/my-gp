import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaExclamationCircle,
  FaQuestionCircle,
  FaTimes,
  FaWallet,
  FaGift,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectUser,
  selectIsAuthenticated,
} from "../../features/auth/authSelectors";
import { api } from "../../api/axios";
import Tab from "../../components/Tab/Tab";

const Tag = ({ text = "+0" }) => (
  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-md bg-gradient-to-r from-[#2f79c9] to-[#63a8ee] px-2 py-[2px] text-[11px] font-extrabold text-white shadow-lg">
    {text}
  </span>
);

const money = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const clampNumber = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return 0;
  return Math.floor(n);
};

const getBonusPreviewText = (bonus) => {
  if (!bonus) return "+0";

  const bonusType = String(bonus?.bonusType || "fixed").toLowerCase();
  const bonusValue = Number(bonus?.bonusValue || 0);

  if (bonusType === "percent") {
    return `+${bonusValue}%`;
  }

  return `+${bonusValue}`;
};

const calcAutoBonus = (amountNum, selectedBonus) => {
  if (!selectedBonus) {
    return {
      bonusAmount: 0,
      turnoverMultiplier: 1,
      creditedAmount: amountNum,
      targetTurnover: amountNum,
    };
  }

  const bonusType = String(selectedBonus?.bonusType || "fixed").toLowerCase();
  const bonusValue = Number(selectedBonus?.bonusValue || 0);
  const turnoverMultiplier =
    Number(selectedBonus?.turnoverMultiplier || 1) || 1;

  let bonusAmount = 0;

  if (bonusType === "percent") {
    bonusAmount = (amountNum * bonusValue) / 100;
  } else {
    bonusAmount = bonusValue;
  }

  bonusAmount = Math.floor(Number(bonusAmount || 0));

  const creditedAmount = amountNum + bonusAmount;
  const targetTurnover = Math.floor(creditedAmount * turnoverMultiplier);

  return {
    bonusAmount,
    turnoverMultiplier,
    creditedAmount,
    targetTurnover,
  };
};

const DepositDetailsModal = ({ open, onClose, onConfirm, details, t }) => {
  if (!open) return null;

  const Row = ({ k, v, valueClass = "text-slate-900" }) => (
    <div className="flex items-center justify-between gap-3">
      <div className="text-[14px] font-semibold text-slate-500">{k}</div>
      <div
        className={`text-right text-[14px] font-extrabold break-all ${valueClass}`}
      >
        {v}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-[92vw] max-w-[460px] rounded-2xl border border-[#2f79c9]/20 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-extrabold text-slate-900">
            {t.depositDetails}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md p-2 text-slate-500 hover:bg-slate-100"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mt-4 h-px bg-slate-200" />

        <div className="mt-5 space-y-3">
          <Row k={t.depositAmount} v={money(details.depositAmount)} />
          <Row k={t.selectedBonus} v={details.bonusTitle} />
          <Row
            k={t.bonusAmount}
            v={money(details.bonusAmount)}
            valueClass="text-[#2f79c9]"
          />
          <Row
            k={t.totalCredited}
            v={money(details.creditedAmount)}
            valueClass="text-emerald-600"
          />
          <Row k={t.turnoverMultiplier} v={`x${details.turnoverMultiplier}`} />
          <Row k={t.targetTurnover} v={money(details.targetTurnover)} />
          <Row k={t.invoiceNumber} v={details.invoiceNumber} />
        </div>

        <button
          type="button"
          onClick={onConfirm}
          className="mt-6 h-[46px] w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#2f79c9] to-[#63a8ee] font-extrabold text-white shadow-lg hover:opacity-95"
        >
          {t.confirm}
        </button>
      </div>
    </div>
  );
};

const AutoDeposit = () => {
  const promoBoxRef = useRef(null);
  const { isBangla } = useLanguage();

  const t = {
    autoDeposit: isBangla ? "অটো ডিপোজিট" : "Auto Deposit",
    autoDepositDisabled: isBangla
      ? "এই মুহূর্তে অটো ডিপোজিট বন্ধ আছে। পরে আবার চেষ্টা করুন।"
      : "Auto deposit is currently disabled. Please try again later.",
    depositAmount: isBangla ? "ডিপোজিট পরিমাণ" : "Deposit Amount",
    promotion: isBangla ? "প্রমোশন" : "Promotion",
    noBonusSelected: isBangla
      ? "কোনো বোনাস নির্বাচন করা হয়নি"
      : "No Bonus Selected",
    noBonus: isBangla ? "কোনো বোনাস নেই" : "No Bonus",
    selectedBonus: isBangla ? "সিলেক্টেড বোনাস" : "Selected Bonus",
    bonusSummary: isBangla ? "বোনাস সামারি" : "Bonus Summary",
    bonusAmount: isBangla ? "বোনাস" : "Bonus",
    totalCredited: isBangla ? "মোট ক্রেডিট" : "Total Credited",
    turnover: isBangla ? "টার্নওভার" : "Turnover",
    turnoverMultiplier: isBangla
      ? "টার্নওভার মাল্টিপ্লায়ার"
      : "Turnover Multiplier",
    targetTurnover: isBangla ? "টার্গেট টার্নওভার" : "Target Turnover",
    minimum: isBangla ? "সর্বনিম্ন" : "Minimum",
    maximum: isBangla ? "সর্বোচ্চ" : "Maximum",
    minimumDepositMustBe: isBangla
      ? "ন্যূনতম ডিপোজিট হতে হবে"
      : "Minimum deposit must be",
    maximumDepositIs: isBangla ? "সর্বোচ্চ ডিপোজিট হলো" : "Maximum deposit is",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    processing: isBangla ? "প্রসেস হচ্ছে..." : "Processing...",
    confirm: isBangla ? "নিশ্চিত করুন" : "Confirm",
    depositDetails: isBangla ? "ডিপোজিট বিস্তারিত" : "Deposit Details",
    invoiceNumber: isBangla ? "ইনভয়েস" : "Invoice",
    pleaseLoginAgain: isBangla
      ? "অনুগ্রহ করে আবার লগইন করুন"
      : "User not found. Please login again.",
    autoDepositDisabledToast: isBangla
      ? "অটো ডিপোজিট বন্ধ আছে"
      : "Auto deposit is disabled",
    paymentLinkFailed: isBangla
      ? "পেমেন্ট লিংক তৈরি করা যায়নি"
      : "Payment link create failed",
    enterAmount: isBangla ? "ডিপোজিট পরিমাণ লিখুন" : "Enter deposit amount",
    loginMismatch: isBangla
      ? "লগইন সেশন mismatch হয়েছে। আবার login করুন।"
      : "Login session mismatch. Please login again.",
    loginRequiredNote: isBangla
      ? "ডিপোজিট করতে লগইন থাকতে হবে"
      : "You must be logged in to deposit",
    selectedBonusInfo: isBangla ? "বোনাস সক্রিয়" : "Bonus Active",
    selectedBonusInfoText: isBangla
      ? "এই ডিপোজিটে নির্বাচিত বোনাস, মোট ক্রেডিট এবং টার্গেট টার্নওভার উপরে দেখানো হয়েছে।"
      : "The selected bonus, total credited amount and target turnover are shown above for this deposit.",
  };

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const userMongoId = user?._id || user?.id || "";
  const userId = user?.userId || "";
  const phone = user?.phone || "";

  const quickAmounts = useMemo(
    () => [
      { v: 200, tag: "" },
      { v: 1000, tag: "" },
      { v: 5000, tag: "" },
      { v: 10000, tag: "" },
      { v: 20000, tag: "" },
      { v: 30000, tag: "" },
    ],
    [],
  );

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [minAmount, setMinAmount] = useState(5);
  const [maxAmount, setMaxAmount] = useState(0);
  const [bonuses, setBonuses] = useState([]);

  const [amount, setAmount] = useState("1000");
  const [promo, setPromo] = useState("none");
  const [promoOpen, setPromoOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pendingInvoice, setPendingInvoice] = useState("");

  useEffect(() => {
    const loadStatus = async () => {
      try {
        setLoadingStatus(true);

        const { data } = await api.get("/api/auto-deposit/status");

        setEnabled(!!data?.data?.enabled);
        setMinAmount(Number(data?.data?.minAmount || 5));
        setMaxAmount(Number(data?.data?.maxAmount || 0));

        const serverBonuses = Array.isArray(data?.data?.bonuses)
          ? data.data.bonuses
          : [];

        const formatted = serverBonuses.map((b) => ({
          _id: String(b?._id || ""),
          title: {
            bn: b?.title?.bn || "",
            en: b?.title?.en || "",
          },
          bonusType: String(b?.bonusType || "fixed").toLowerCase(),
          bonusValue: Number(b?.bonusValue || 0),
          turnoverMultiplier: Number(b?.turnoverMultiplier || 1),
        }));

        setBonuses(formatted);
      } catch (e) {
        setEnabled(false);
        setMinAmount(5);
        setMaxAmount(0);
        setBonuses([]);
      } finally {
        setLoadingStatus(false);
      }
    };

    loadStatus();
  }, []);

  const promotions = useMemo(() => {
    return [
      {
        _id: "none",
        name: t.noBonusSelected,
        bonusType: "fixed",
        bonusValue: 0,
        turnoverMultiplier: 1,
      },
      ...bonuses.map((b) => ({
        ...b,
        name: isBangla
          ? b?.title?.bn || b?.title?.en
          : b?.title?.en || b?.title?.bn,
      })),
    ];
  }, [bonuses, isBangla, t.noBonusSelected]);

  useEffect(() => {
    const exists = promotions.some((p) => String(p._id) === String(promo));
    if (!exists) setPromo("none");
  }, [promotions, promo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!promoBoxRef.current) return;
      if (!promoBoxRef.current.contains(event.target)) {
        setPromoOpen(false);
      }
    };

    if (promoOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [promoOpen]);

  const selectedBonus = useMemo(() => {
    if (promo === "none") return null;
    return bonuses.find((b) => String(b._id) === String(promo)) || null;
  }, [promo, bonuses]);

  const amountNum = clampNumber(amount);
  const amountHasValue = amountNum > 0;

  const inMin = amountNum >= (minAmount > 0 ? minAmount : 0);
  const inMax = maxAmount > 0 ? amountNum <= maxAmount : true;
  const amountValid = amountHasValue && inMin && inMax;

  const amountErrorText = useMemo(() => {
    if (!amountHasValue) return "";
    if (!inMin) return `${t.minimumDepositMustBe} ${money(minAmount)}`;
    if (!inMax) return `${t.maximumDepositIs} ${money(maxAmount)}`;
    return "";
  }, [
    amountHasValue,
    inMin,
    inMax,
    minAmount,
    maxAmount,
    t.minimumDepositMustBe,
    t.maximumDepositIs,
  ]);

  const { bonusAmount, turnoverMultiplier, creditedAmount, targetTurnover } =
    calcAutoBonus(amountNum, selectedBonus);

  const selectedBonusLabel = selectedBonus
    ? isBangla
      ? selectedBonus?.title?.bn || selectedBonus?.title?.en
      : selectedBonus?.title?.en || selectedBonus?.title?.bn
    : t.noBonus;

  const modalDetails = {
    depositAmount: amountNum,
    bonusTitle: selectedBonusLabel,
    bonusAmount,
    creditedAmount,
    turnoverMultiplier,
    targetTurnover,
    invoiceNumber: pendingInvoice,
  };

  const hasValidAuthForDeposit = isAuthenticated && !!phone && !!userMongoId;

  const canDeposit =
    enabled && hasValidAuthForDeposit && amountValid && !processing;

  const handleOpenDeposit = () => {
    if (!enabled) {
      toast.error(t.autoDepositDisabledToast);
      return;
    }

    if (!hasValidAuthForDeposit) {
      toast.error(t.loginMismatch);
      return;
    }

    if (!amountValid) {
      toast.error(amountErrorText || t.enterAmount);
      return;
    }

    const invoice = `AUTO-${userMongoId}-${Date.now()}`;
    setPendingInvoice(invoice);
    setDetailsOpen(true);
  };

  const handleConfirmDeposit = async () => {
    try {
      setProcessing(true);

      if (!userMongoId) {
        toast.error(t.loginMismatch);
        return;
      }

      const invoiceNumber =
        pendingInvoice || `AUTO-${userMongoId}-${Date.now()}`;

      const { data } = await api.post("/api/auto-deposit/create", {
        amount: amountNum,
        userIdentity: userMongoId,
        invoiceNumber,
        selectedBonusId: selectedBonus?._id || "",
        checkoutItems: {
          type: "deposit",
          method: "auto",
          gateway: "oraclepay",
          userId: userId || "",
          phone: phone || "",
          username: userId || "",
          selectedBonusId: selectedBonus?._id || "",
        },
      });

      if (data?.success && data?.payment_page_url) {
        window.location.href = data.payment_page_url;
        return;
      }

      toast.error(data?.message || t.paymentLinkFailed);
    } catch (e) {
      toast.error(e?.response?.data?.message || t.paymentLinkFailed);
    } finally {
      setProcessing(false);
      setDetailsOpen(false);
    }
  };

  if (loadingStatus) {
    return (
      <>
        <Tab />
        <div className="mb-28 w-full bg-white text-slate-900">
          <div className="grid grid-cols-1 gap-4">
            <div className="border border-[#2f79c9]/20 bg-white p-5 shadow-lg sm:p-6">
              <div className="text-[14px] font-semibold text-slate-500">
                {isBangla ? "লোড হচ্ছে..." : "Loading..."}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!enabled) {
    return (
      <>
        <Tab />
        <div className="mb-28 w-full bg-white text-slate-900">
          <div className="grid grid-cols-1 gap-4">
            <div className="border border-[#2f79c9]/20 bg-white p-5 shadow-lg sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f79c9] to-[#63a8ee] text-white shadow-lg">
                  <FaWallet className="text-xl" />
                </div>
                <div className="text-[20px] font-extrabold text-slate-900">
                  {t.autoDeposit}
                </div>
              </div>

              <div className="mt-5 text-[14px] text-slate-500">
                {t.autoDepositDisabled}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Tab />

      <div className="mb-28 w-full bg-white text-slate-900">
        <div className="grid grid-cols-1 gap-4">
          <div className="border border-[#2f79c9]/20 bg-white p-5 shadow-lg sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f79c9] to-[#63a8ee] text-white shadow-lg">
                <FaWallet className="text-xl" />
              </div>
              <div className="text-[20px] font-extrabold text-slate-900">
                {t.autoDeposit}
              </div>
            </div>

            {!hasValidAuthForDeposit && (
              <div className="mt-5 max-w-[520px] rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="mt-0.5 text-amber-600" />
                  <div>
                    <div className="text-[13px] font-extrabold text-amber-700">
                      {isBangla ? "লগইন প্রয়োজন" : "Login Required"}
                    </div>
                    <div className="mt-1 text-[12px] text-amber-700/80">
                      {t.loginRequiredNote}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[14px] font-semibold text-slate-900">
                  {t.depositAmount} <span className="text-red-500">*</span>
                </label>
                <FaQuestionCircle className="text-slate-500" />
              </div>

              <div className="mt-3">
                <input
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder={t.enterAmount}
                  className={`w-full max-w-[520px] rounded-xl border px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-[#2f79c9]/20 ${
                    amountHasValue && !amountValid
                      ? "border-red-400 bg-red-50"
                      : "border-slate-200 bg-white"
                  }`}
                  inputMode="numeric"
                />
              </div>

              {(minAmount > 0 || maxAmount > 0) && (
                <div className="mt-2 text-[12px] text-slate-500">
                  {minAmount > 0 ? `${t.minimum}: ${money(minAmount)}` : ""}
                  {minAmount > 0 && maxAmount > 0 ? " — " : ""}
                  {maxAmount > 0 ? `${t.maximum}: ${money(maxAmount)}` : ""}
                </div>
              )}

              {amountErrorText && (
                <div className="mt-2 text-[12px] font-semibold text-red-500">
                  {amountErrorText}
                </div>
              )}

              <div className="mt-5 grid max-w-[720px] grid-cols-3 gap-4">
                {quickAmounts.map((a) => {
                  const active = String(a.v) === String(amount);

                  return (
                    <button
                      key={a.v}
                      type="button"
                      onClick={() => setAmount(String(a.v))}
                      className={`relative h-[44px] cursor-pointer rounded-xl font-extrabold text-[15px] transition ${
                        active
                          ? "bg-gradient-to-r from-[#2f79c9] to-[#63a8ee] text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {a.tag ? <Tag text={a.tag} /> : null}
                      {a.v}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-2">
                <label className="text-[14px] font-semibold text-slate-900">
                  {t.promotion} <span className="text-red-500">*</span>
                </label>
                <FaExclamationCircle className="text-[#2f79c9]" />
              </div>

              <div ref={promoBoxRef} className="relative mt-3 max-w-[520px]">
                <button
                  type="button"
                  onClick={() => setPromoOpen((p) => !p)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] hover:border-[#2f79c9]/60"
                >
                  <span className="font-semibold text-slate-800">
                    {promotions.find((x) => String(x._id) === String(promo))
                      ?.name || t.noBonusSelected}
                  </span>

                  <div className="flex items-center gap-3">
                    {promo !== "none" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPromo("none");
                        }}
                        className="cursor-pointer rounded-md p-1 hover:bg-slate-100"
                      >
                        <FaTimes className="text-slate-400" />
                      </button>
                    )}
                    <span className="text-slate-400">▾</span>
                  </div>
                </button>

                {promoOpen && (
                  <div className="absolute z-[9999] mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                    {promotions.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => {
                          setPromo(p._id);
                          setPromoOpen(false);
                        }}
                        className={`block w-full cursor-pointer px-4 py-3 text-left text-[14px] font-semibold transition hover:bg-[#2f79c9]/5 ${
                          String(promo) === String(p._id)
                            ? "bg-[#2f79c9]/10 text-[#2f79c9]"
                            : "text-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span>{p.name}</span>

                          {p._id !== "none" ? (
                            <span className="text-[12px] font-extrabold text-[#2f79c9]">
                              {getBonusPreviewText(p)} | x
                              {Number(p?.turnoverMultiplier || 1)}
                            </span>
                          ) : (
                            <span className="text-[12px] font-bold text-slate-400">
                              x1
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="rounded-xl border border-[#2f79c9]/20 bg-[#2f79c9]/5 p-4 max-w-[520px]">
                <div className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
                  <FaGift className="text-[#2f79c9]" />
                  {t.bonusSummary}
                </div>

                <div className="mt-3 space-y-2 text-[13px]">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>{t.selectedBonus}</span>
                    <span className="font-extrabold text-slate-900">
                      {selectedBonusLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>{t.bonusAmount}</span>
                    <span className="font-extrabold text-[#2f79c9]">
                      {money(bonusAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>{t.totalCredited}</span>
                    <span className="font-extrabold text-emerald-600">
                      {money(creditedAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>{t.turnover}</span>
                    <span className="font-extrabold text-slate-900">
                      x{turnoverMultiplier} ({money(targetTurnover)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedBonus && (
              <div className="mt-4 max-w-[520px] rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="mt-0.5 text-emerald-600" />
                  <div>
                    <div className="text-[13px] font-extrabold text-emerald-700">
                      {t.selectedBonusInfo}
                    </div>
                    <div className="mt-1 text-[12px] text-emerald-700/80">
                      {t.selectedBonusInfoText}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 max-w-[520px]">
              <button
                type="button"
                onClick={handleOpenDeposit}
                disabled={!canDeposit}
                className={`h-[46px] w-full rounded-xl font-extrabold text-[14px] transition ${
                  canDeposit
                    ? "cursor-pointer bg-gradient-to-r from-[#2f79c9] to-[#63a8ee] text-white shadow-lg hover:opacity-95"
                    : "cursor-not-allowed bg-slate-200 text-slate-400"
                }`}
              >
                {processing ? t.processing : t.deposit}
              </button>

              <div className="mt-2 text-[12px] text-slate-500">
                {t.turnover}: x{turnoverMultiplier}
              </div>
            </div>
          </div>
        </div>

        <DepositDetailsModal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          onConfirm={handleConfirmDeposit}
          details={modalDetails}
          t={t}
        />
      </div>
    </>
  );
};

export default AutoDeposit;

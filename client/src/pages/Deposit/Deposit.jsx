import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaExclamationCircle,
  FaQuestionCircle,
  FaTimes,
  FaWallet,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import DepositModal from "../DepositModal/DepositModal";
import Tab from "../../components/Tab/Tab";
import { useLanguage } from "../../Context/LanguageProvider";

const OptionLogo = ({ type }) => {
  const base = "w-10 h-10 rounded-full flex items-center justify-center";
  return (
    <div className={`${base} bg-[#eaf3fd]`}>
      <span className="font-extrabold text-[#2f79c9] text-[13px]">
        {(type || "P").slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
};

const Tag = ({ text = "+0%" }) => (
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

const parsePercentFromTag = (tagText) => {
  if (typeof tagText !== "string") return 0;
  if (!tagText.includes("%")) return 0;
  const p = parseFloat(tagText.replace("+", "").replace("%", ""));
  return Number.isFinite(p) ? p : 0;
};

const calcBonus = (
  amountNum,
  promoId,
  channelTagText,
  methodPromotions = [],
) => {
  const percent = parsePercentFromTag(channelTagText);
  const percentBonus = (amountNum * percent) / 100;

  const promoDoc = (methodPromotions || []).find(
    (p) =>
      String(p?.id || "").toLowerCase() === String(promoId || "").toLowerCase(),
  );

  let promoBonus = 0;
  let promoTurnover = null;

  if (promoDoc && promoId !== "none" && promoDoc?.isActive !== false) {
    const bonusValue = Number(promoDoc?.bonusValue ?? 0) || 0;

    if (promoDoc?.bonusType === "percent") {
      promoBonus = (amountNum * bonusValue) / 100;
    } else {
      promoBonus = bonusValue;
    }

    promoTurnover = Number(promoDoc?.turnoverMultiplier ?? 0) || null;
  }

  return {
    promoBonus,
    percentBonus,
    percent,
    promoTurnover,
    totalBonus: promoBonus + percentBonus,
  };
};

const DepositDetailsModal = ({ open, onClose, onConfirm, details, t }) => {
  if (!open) return null;

  const Row = ({ k, v }) => (
    <div className="flex items-center justify-between">
      <div className="text-[14px] font-semibold text-slate-500">{k}</div>
      <div className="text-[14px] font-extrabold text-slate-900">{v}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[92vw] max-w-[440px] rounded-2xl border border-[#2f79c9]/20 bg-white p-6 shadow-2xl">
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
          <Row k={t.promoBonus} v={money(details.promoBonus)} />
          <Row
            k={`+${details.percent}% ${t.channelBonus}`}
            v={money(details.percentBonus)}
          />
          <Row k={t.turnoverMultiplier} v={`x${details.turnoverMultiplier}`} />
          <Row k={t.targetTurnover} v={money(details.targetTurnover)} />
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

const Deposit = () => {
  const promoBoxRef = useRef(null);
  const { language, isBangla } = useLanguage();

  const t = {
    manualDeposit: isBangla ? "ম্যানুয়াল ডিপোজিট" : "Manual Deposit",
    depositOptions: isBangla ? "ডিপোজিট অপশন" : "Deposit Options",
    depositChannel: isBangla ? "ডিপোজিট চ্যানেল" : "Deposit Channel",
    depositAmount: isBangla ? "ডিপোজিট পরিমাণ" : "Deposit Amount",
    promotion: isBangla ? "প্রোমোশন" : "Promotion",
    noBonusSelected: isBangla
      ? "কোনো বোনাস নির্বাচন করা হয়নি"
      : "No Bonus Selected",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    noDepositMethods: isBangla
      ? "কোনো ডিপোজিট মেথড পাওয়া যায়নি।"
      : "No deposit methods found.",
    noChannelFound: isBangla
      ? "এই মেথডের জন্য কোনো চ্যানেল পাওয়া যায়নি।"
      : "No channel found for this method.",
    minimum: isBangla ? "সর্বনিম্ন" : "Minimum",
    maximum: isBangla ? "সর্বোচ্চ" : "Maximum",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    turnover: isBangla ? "টার্নওভার" : "Turnover",
    pleaseSelectMethod: isBangla
      ? "একটি ডিপোজিট মেথড নির্বাচন করুন"
      : "Please select a deposit method",
    pleaseSelectChannel: isBangla
      ? "একটি ডিপোজিট চ্যানেল নির্বাচন করুন"
      : "Please select a deposit channel",
    depositNumberNotFound: isBangla
      ? "ডিপোজিট নাম্বার পাওয়া যায়নি"
      : "Deposit number not found",
    validAmount: isBangla ? "সঠিক পরিমাণ লিখুন" : "Please enter a valid amount",
    minimumDepositMustBe: isBangla
      ? "সর্বনিম্ন ডিপোজিট হতে হবে"
      : "Minimum deposit must be",
    maximumDepositIs: isBangla ? "সর্বোচ্চ ডিপোজিট হলো" : "Maximum deposit is",
    depositDetails: isBangla ? "ডিপোজিট বিস্তারিত" : "Deposit Details",
    promoBonus: isBangla ? "প্রোমো বোনাস" : "Promo Bonus",
    channelBonus: isBangla ? "চ্যানেল বোনাস" : "Channel Bonus",
    turnoverMultiplier: isBangla
      ? "টার্নওভার মাল্টিপ্লায়ার"
      : "Turnover Multiplier",
    targetTurnover: isBangla ? "টার্গেট টার্নওভার" : "Target Turnover",
    confirm: isBangla ? "নিশ্চিত করুন" : "Confirm",
    enterDepositAmount: isBangla
      ? "ডিপোজিট পরিমাণ লিখুন"
      : "Enter deposit amount",
  };

  const { data: methodsRes = {}, isLoading } = useQuery({
    queryKey: ["deposit-methods-public"],
    queryFn: async () => {
      const res = await api.get("/api/deposit-methods/public");
      return res.data;
    },
    staleTime: 30000,
    retry: 1,
  });

  const methods = useMemo(
    () => (methodsRes?.data || []).filter((m) => m?.isActive !== false),
    [methodsRes],
  );

  const quickAmounts = useMemo(
    () => [
      { v: 200, tag: "" },
      { v: 1000, tag: "+3%" },
      { v: 5000, tag: "+3%" },
      { v: 10000, tag: "+3%" },
      { v: 20000, tag: "+3%" },
      { v: 30000, tag: "+3%" },
    ],
    [],
  );

  const [selectedOption, setSelectedOption] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [amount, setAmount] = useState("1000");
  const [promo, setPromo] = useState("none");
  const [promoOpen, setPromoOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  useEffect(() => {
    if (methods?.length && !selectedOption) {
      const first = methods[0];
      setSelectedOption(first?.methodId || "");
      const firstChannel =
        (first?.channels || []).filter((c) => c?.isActive !== false)?.[0]?.id ||
        "";
      setSelectedChannel(firstChannel);
    }
  }, [methods, selectedOption]);

  const selectedMethod = useMemo(
    () => methods.find((m) => m.methodId === selectedOption) || null,
    [methods, selectedOption],
  );

  const channels = useMemo(() => {
    const ch = selectedMethod?.channels || [];
    return ch.filter((c) => c?.isActive !== false);
  }, [selectedMethod]);

  const selectedChannelDoc = useMemo(
    () =>
      channels.find((c) => String(c.id) === String(selectedChannel)) || null,
    [channels, selectedChannel],
  );

  const activeContacts = useMemo(() => {
    const contacts = Array.isArray(selectedMethod?.contacts)
      ? selectedMethod.contacts
      : [];
    return contacts
      .filter((c) => c?.isActive !== false)
      .sort((a, b) => Number(a?.sort ?? 0) - Number(b?.sort ?? 0));
  }, [selectedMethod]);

  const selectedContactDoc = useMemo(() => {
    return activeContacts[0] || null;
  }, [activeContacts]);

  const promotions = useMemo(() => {
    const list = Array.isArray(selectedMethod?.promotions)
      ? selectedMethod.promotions
      : [];

    const active = list
      .filter((p) => p?.isActive !== false)
      .sort((a, b) => Number(a?.sort ?? 0) - Number(b?.sort ?? 0));

    return [
      { id: "none", name: t.noBonusSelected },
      ...active.map((p) => ({
        id: p.id,
        name:
          language === "Bangla"
            ? p?.name?.bn || p?.name?.en || p.id
            : p?.name?.en || p?.name?.bn || p.id,
        bonusType: p?.bonusType,
        bonusValue: p?.bonusValue,
        turnoverMultiplier: p?.turnoverMultiplier,
      })),
    ];
  }, [selectedMethod, language, t.noBonusSelected]);

  useEffect(() => {
    if (!selectedMethod) return;
    const exists = channels.some(
      (c) => String(c.id) === String(selectedChannel),
    );
    if (!exists) {
      setSelectedChannel(channels?.[0]?.id || "");
    }
  }, [selectedMethod, channels, selectedChannel]);

  useEffect(() => {
    const exists = promotions.some((p) => p.id === promo);
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

  const channelTagText = selectedChannelDoc?.tagText || "+0%";
  const amountNum = Number(amount || 0) || 0;

  const minDeposit = Number(selectedMethod?.minDepositAmount ?? 0) || 0;
  const maxDeposit = Number(selectedMethod?.maxDepositAmount ?? 0) || 0;

  const inMin = amountNum >= (minDeposit > 0 ? minDeposit : 0);
  const inMax = maxDeposit > 0 ? amountNum <= maxDeposit : true;
  const amountHasValue = amountNum > 0;
  const amountValid = amountHasValue && inMin && inMax;

  const amountErrorText = useMemo(() => {
    if (!selectedMethod || !amountHasValue) return "";
    if (!inMin) return `${t.minimumDepositMustBe} ${money(minDeposit)}`;
    if (!inMax) return `${t.maximumDepositIs} ${money(maxDeposit)}`;
    return "";
  }, [
    selectedMethod,
    amountHasValue,
    inMin,
    inMax,
    minDeposit,
    maxDeposit,
    t.minimumDepositMustBe,
    t.maximumDepositIs,
  ]);

  const methodPromotionsRaw = Array.isArray(selectedMethod?.promotions)
    ? selectedMethod.promotions
    : [];

  const { promoBonus, percentBonus, percent, promoTurnover } = calcBonus(
    amountNum,
    promo,
    channelTagText,
    methodPromotionsRaw,
  );

  const turnoverMultiplier =
    promo !== "none" && promoTurnover
      ? promoTurnover
      : Number(selectedMethod?.turnoverMultiplier ?? 1);

  const targetTurnover =
    (amountNum + promoBonus + percentBonus) * turnoverMultiplier;

  const modalDetails = {
    depositAmount: amountNum,
    promoBonus,
    percentBonus,
    percent,
    turnoverMultiplier,
    targetTurnover,
  };

  const apiBase = import.meta.env.VITE_API_URL || "";

  const canDeposit =
    !!selectedMethod &&
    !!selectedChannel &&
    !!selectedChannelDoc &&
    !!selectedContactDoc &&
    amountValid;

  const handleOpenDeposit = () => {
    if (!selectedMethod) {
      toast.error(t.pleaseSelectMethod);
      return;
    }

    if (!selectedChannelDoc) {
      toast.error(t.pleaseSelectChannel);
      return;
    }

    if (!selectedContactDoc?.number) {
      toast.error(t.depositNumberNotFound);
      return;
    }

    if (!amountValid) {
      toast.error(amountErrorText || t.validAmount);
      return;
    }

    setDetailsOpen(true);
  };

  return (
    <>
      <Tab />
      <div className="mb-48 w-full bg-white text-slate-900">
        <div className="grid grid-cols-1 gap-4">
          <div className="border border-[#2f79c9]/20 bg-white p-5 shadow-lg sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f79c9] to-[#63a8ee] text-white shadow-lg">
                <FaWallet className="text-xl" />
              </div>
              <div className="text-[20px] font-extrabold text-slate-900">
                {t.manualDeposit}
              </div>
            </div>

            <div className="mt-5">
              <label className="text-[14px] font-semibold text-slate-900">
                {t.depositOptions} <span className="text-red-500">*</span>
              </label>

              {isLoading ? (
                <div className="mt-3 text-[13px] text-slate-500">
                  {t.loading}
                </div>
              ) : methods.length ? (
                <div className="mt-3 flex flex-wrap gap-3">
                  {methods.map((m) => {
                    const active = selectedOption === m.methodId;
                    const displayMethodName =
                      language === "Bangla"
                        ? m?.methodName?.bn || m?.methodName?.en || m?.methodId
                        : m?.methodName?.en || m?.methodName?.bn || m?.methodId;

                    return (
                      <button
                        key={m._id || m.methodId}
                        type="button"
                        onClick={() => {
                          setSelectedOption(m.methodId);
                          setPromo("none");
                          setPromoOpen(false);
                        }}
                        className={`flex h-[60px] w-[100px] cursor-pointer items-center justify-center rounded-xl border-2 bg-white transition ${
                          active
                            ? "border-[#2f79c9] shadow-lg"
                            : "border-slate-200 hover:border-[#2f79c9]/60"
                        }`}
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
                  {t.noDepositMethods}
                </div>
              )}
            </div>

            <div className="mt-6">
              <label className="text-[14px] font-semibold text-slate-900">
                {t.depositChannel} <span className="text-red-500">*</span>
              </label>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {channels.length ? (
                  channels.map((c) => {
                    const active = selectedChannel === c.id;
                    const name =
                      language === "Bangla"
                        ? c?.name?.bn || c?.name?.en || c.id
                        : c?.name?.en || c?.name?.bn || c.id;

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedChannel(c.id)}
                        className={`relative cursor-pointer rounded-xl border px-5 py-2 text-[14px] font-extrabold transition ${
                          active
                            ? "border-[#2f79c9] bg-[#2f79c9]/5 shadow-lg"
                            : "border-slate-200 bg-white hover:border-[#2f79c9]/60"
                        }`}
                      >
                        <Tag text={c.tagText || "+0%"} />
                        {name}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-[13px] text-slate-500">
                    {t.noChannelFound}
                  </div>
                )}
              </div>
            </div>

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
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t.enterDepositAmount}
                  className={`w-full max-w-[520px] rounded-xl border px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-[#2f79c9]/20 ${
                    amountHasValue && !amountValid
                      ? "border-red-400 bg-red-50"
                      : "border-slate-200 bg-white"
                  }`}
                />
              </div>

              {(minDeposit > 0 || maxDeposit > 0) && (
                <div className="mt-2 text-[12px] text-slate-500">
                  {minDeposit > 0 ? `${t.minimum}: ${money(minDeposit)}` : ""}
                  {minDeposit > 0 && maxDeposit > 0 ? " — " : ""}
                  {maxDeposit > 0 ? `${t.maximum}: ${money(maxDeposit)}` : ""}
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
                    {promotions.find((x) => x.id === promo)?.name ||
                      t.noBonusSelected}
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
                  <div className="absolute z-[9999] mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-2xl">
                    {promotions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPromo(p.id);
                          setPromoOpen(false);
                        }}
                        className={`block w-full cursor-pointer px-4 py-3 text-left text-[14px] font-semibold transition hover:bg-[#2f79c9]/5 ${
                          promo === p.id
                            ? "bg-[#2f79c9]/10 text-[#2f79c9]"
                            : "text-slate-800"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

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
                {t.deposit}
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
          onConfirm={() => {
            setDetailsOpen(false);
            setPayOpen(true);
          }}
          details={modalDetails}
          t={t}
        />

        <DepositModal
          open={payOpen}
          onClose={() => setPayOpen(false)}
          data={{
            amount: amountNum,
            methodId: selectedOption,
            channelId: selectedChannel,
            customerCode: "6538651",
            promoId: promo,
          }}
          details={modalDetails}
          methodDoc={selectedMethod}
          channelDoc={selectedChannelDoc}
          contactDoc={selectedContactDoc}
        />
      </div>
    </>
  );
};

export default Deposit;

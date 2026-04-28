import React, { useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  Check,
  Copy,
  Gift,
  Share2,
  Users,
  Wallet,
  Trophy,
  X,
  Coins,
  RefreshCw,
  History,
  Calculator,
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { selectUser } from "../../features/auth/authSelectors";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const money = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Share = () => {
  const { isBangla } = useLanguage();
  const authUser = useSelector(selectUser);

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [info, setInfo] = useState(null);
  const [referredUsers, setReferredUsers] = useState([]);
  const [histories, setHistories] = useState([]);
  const [redeemAmount, setRedeemAmount] = useState("");

  const user = info?.user || authUser || {};
  const setting = info?.setting || {};
  const calculation = info?.calculation || {};

  const referralCode = user?.referralCode || "";
  const clientBase =
    import.meta.env.VITE_CLIENT_URL ||
    import.meta.env.VITE_APP_URL ||
    window.location.origin;

  const referralLink = `${clientBase}/register?ref=${referralCode}`;

  const t = useMemo(
    () => ({
      title: isBangla ? "শেয়ার করুন" : "Share",
      subtitle: isBangla
        ? "বন্ধুদের আমন্ত্রণ করুন এবং রিওয়ার্ড অর্জন করুন"
        : "Invite your friends and earn rewards",
      codeLabel: isBangla ? "আপনার রেফারেল লিংক" : "Your Referral Link",
      copy: isBangla ? "কপি" : "Copy",
      copied: isBangla ? "কপি হয়েছে" : "Copied",
      inviteTitle: isBangla ? "বন্ধু ইনভাইট করুন" : "Invite Friends",
      inviteText: isBangla
        ? "আপনার রেফারেল লিংক শেয়ার করুন। আপনার বন্ধু রেজিস্টার করলে আপনার রেফার পয়েন্ট যোগ হবে।"
        : "Share your referral link. When your friend registers, your referral points will be added.",
      totalInvite: isBangla ? "মোট ইনভাইট" : "Total Invites",
      points: isBangla ? "রেফার পয়েন্ট" : "Refer Points",
      estimated: isBangla ? "সম্ভাব্য টাকা" : "Estimated Money",
      recentUsers: isBangla
        ? "সাম্প্রতিক রেফারেল ইউজার"
        : "Recent Referral Users",
      noCode: isBangla ? "রেফারেল কোড পাওয়া যায়নি" : "Referral code not found.",
      copyFailed: isBangla ? "কপি করা যায়নি" : "Copy failed.",
      redeem: isBangla ? "রিডিম করুন" : "Redeem",
      redeemNow: isBangla ? "এখন রিডিম করুন" : "Redeem Now",
      redeemSummary: isBangla ? "রিডিম সামারি" : "Redeem Summary",
      redeemAmount: isBangla ? "রিডিম এমাউন্ট" : "Redeem Amount",
      requiredPoints: isBangla ? "লাগবে পয়েন্ট" : "Required Points",
      afterRedeem: isBangla ? "রিডিমের পরে পয়েন্ট" : "Points After Redeem",
      history: isBangla ? "রিডিম হিস্টোরি" : "Redeem History",
      noUsers: isBangla ? "এখনো কোনো ইউজার নেই" : "No referred users yet",
      noHistory: isBangla ? "এখনো কোনো হিস্টোরি নেই" : "No redeem history yet",
      active: isBangla ? "অ্যাক্টিভ" : "Active",
      inactive: isBangla ? "ইনঅ্যাক্টিভ" : "Inactive",
    }),
    [isBangla],
  );

  const points = Number(user?.referCommissionBalance || 0);
  const totalInvite = Number(user?.referralCount || referredUsers.length || 0);
  const estimatedRedeemAmount = Number(calculation?.estimatedRedeemAmount || 0);

  const redeemPoint = Number(setting?.redeemPoint || 0);
  const redeemMoney = Number(setting?.redeemMoney || 0);
  const enteredAmount = Number(redeemAmount || 0);

  const requiredPoints =
    enteredAmount > 0 && redeemPoint > 0 && redeemMoney > 0
      ? (enteredAmount / redeemMoney) * redeemPoint
      : 0;

  const pointsAfterRedeem = points - requiredPoints;

  const canRedeem =
    setting?.isActive &&
    enteredAmount > 0 &&
    requiredPoints > 0 &&
    points >= requiredPoints &&
    enteredAmount >= Number(setting?.minimumRedeemAmount || 0) &&
    (Number(setting?.maximumRedeemAmount || 0) <= 0 ||
      enteredAmount <= Number(setting?.maximumRedeemAmount || 0));

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [infoRes, usersRes, historyRes] = await Promise.all([
        api.get("/api/user/refer-redeem/info"),
        api.get("/api/user/refer-redeem/referred-users"),
        api.get("/api/user/refer-redeem/histories"),
      ]);

      setInfo(infoRes?.data?.data || null);
      setReferredUsers(
        Array.isArray(usersRes?.data?.data) ? usersRes.data.data : [],
      );
      setHistories(
        Array.isArray(historyRes?.data?.data) ? historyRes.data.data : [],
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load referral data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCopy = async () => {
    if (!referralCode) {
      toast.error(t.noCode);
      return;
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success(
        isBangla ? "রেফারেল লিংক কপি হয়েছে" : "Referral link copied.",
      );
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(t.copyFailed);
    }
  };

  const openRedeemModal = () => {
    const min = Number(setting?.minimumRedeemAmount || 0);
    setRedeemAmount(min > 0 ? String(min) : "");
    setModalOpen(true);
  };

  const handleRedeem = async () => {
    if (!canRedeem) {
      toast.error(
        isBangla
          ? "রিডিম করার জন্য সঠিক এমাউন্ট দিন"
          : "Please enter a valid redeem amount",
      );
      return;
    }

    try {
      setRedeeming(true);

      const { data } = await api.post("/api/user/refer-redeem/redeem", {
        redeemAmount: enteredAmount,
      });

      toast.success(data?.message || "Redeem successful");
      setModalOpen(false);
      setRedeemAmount("");
      fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Redeem failed");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="mb-48 min-h-screen bg-[#f5f8fc] text-[#1f2937]">
      <div className="mx-auto w-full max-w-[560px] px-3 pb-8 pt-4 sm:px-4">
        <div className="mb-5 overflow-hidden rounded-[28px] bg-[#2f79c9] p-5 text-white shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f07a2a] text-white shadow-sm">
              <Share2 size={28} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-[24px] font-black leading-tight">
                {t.inviteTitle}
              </h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-white/80">
                {t.subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchAll}
              disabled={loading}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <p className="mt-5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold leading-6 text-white/90">
            {t.inviteText}
          </p>
        </div>

        <div className="mb-5 rounded-[22px] border border-[#2f79c9]/15 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-[#2f79c9]">
            <BadgePercent size={18} />
            <span className="text-sm font-extrabold">{t.codeLabel}</span>
          </div>

          <div className="rounded-2xl border border-[#c7d8eb] bg-[#f5f8fc] px-3 py-3">
            <p className="break-all text-[13px] font-bold leading-5 text-[#1f5f98] sm:text-[15px]">
              {referralCode ? referralLink : "N/A"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#f07a2a] text-[16px] font-black text-white transition hover:bg-[#d9651e] active:scale-[0.98]"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? t.copied : t.copy}
          </button>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          <StatCard
            icon={<Users size={22} />}
            label={t.totalInvite}
            value={totalInvite}
            color="#2f79c9"
          />
          <StatCard
            icon={<Coins size={22} />}
            label={t.points}
            value={points.toLocaleString("en-US")}
            color="#f07a2a"
          />
          <StatCard
            icon={<Wallet size={22} />}
            label={t.estimated}
            value={money(estimatedRedeemAmount)}
            color="#2f79c9"
          />
        </div>

        <div className="mb-5 rounded-[22px] border border-[#2f79c9]/15 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Calculator size={20} className="text-[#f07a2a]" />
                <h3 className="text-[17px] font-black text-[#1f5f98]">
                  {t.redeemSummary}
                </h3>
              </div>
              <p className="mt-1 text-xs font-bold text-gray-500">
                {Number(setting?.redeemPoint || 0).toLocaleString("en-US")}{" "}
                Point = {money(setting?.redeemMoney)}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                setting?.isActive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {setting?.isActive ? t.active : t.inactive}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-[#f5f8fc] p-3">
              <p className="text-xs font-bold text-gray-500">
                {isBangla ? "মিনিমাম" : "Minimum"}
              </p>
              <p className="mt-1 text-base font-black text-[#1f5f98]">
                {money(setting?.minimumRedeemAmount)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f8fc] p-3">
              <p className="text-xs font-bold text-gray-500">
                {isBangla ? "ম্যাক্সিমাম" : "Maximum"}
              </p>
              <p className="mt-1 text-base font-black text-[#1f5f98]">
                {Number(setting?.maximumRedeemAmount || 0) > 0
                  ? money(setting?.maximumRedeemAmount)
                  : isBangla
                    ? "লিমিট নেই"
                    : "No limit"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openRedeemModal}
            disabled={!setting?.isActive || points <= 0}
            className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#2f79c9] text-[16px] font-black text-white transition hover:bg-[#1f5f98] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Gift size={18} />
            {t.redeem}
          </button>
        </div>

        <div className="mb-5 rounded-[22px] border border-[#2f79c9]/15 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Gift size={20} className="text-[#f07a2a]" />
            <h3 className="text-[17px] font-black text-[#1f5f98]">
              {t.recentUsers}
            </h3>
          </div>

          <div className="space-y-3">
            {referredUsers.length === 0 ? (
              <p className="rounded-2xl bg-[#f5f8fc] p-4 text-center text-sm font-bold text-gray-500">
                {t.noUsers}
              </p>
            ) : (
              referredUsers.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#2f79c9]/10 bg-[#f5f8fc] p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2f79c9] text-sm font-black text-white">
                      {String(item.userId || "U").slice(0, 1)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#1f5f98]">
                        {item.userId}
                      </p>
                      <p className="text-xs font-bold text-gray-500">
                        {item.countryCode} {item.phone} •{" "}
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                      item.isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {item.isActive ? t.active : t.inactive}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[22px] border border-[#2f79c9]/15 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <History size={20} className="text-[#2f79c9]" />
            <h3 className="text-[17px] font-black text-[#1f5f98]">
              {t.history}
            </h3>
          </div>

          <div className="space-y-3">
            {histories.length === 0 ? (
              <p className="rounded-2xl bg-[#f5f8fc] p-4 text-center text-sm font-bold text-gray-500">
                {t.noHistory}
              </p>
            ) : (
              histories.slice(0, 10).map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-[#2f79c9]/10 bg-[#f5f8fc] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[#1f5f98]">
                        {money(item.redeemAmount)}
                      </p>
                      <p className="text-xs font-bold text-gray-500">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600">
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold text-gray-500">
                    <p>
                      Points: {Number(item.pointsUsed || 0).toLocaleString()}
                    </p>
                    <p>
                      After: {Number(item.pointsAfter || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/55 px-3 pb-3 backdrop-blur-sm sm:items-center sm:pb-0">
          <div className="w-full max-w-[460px] rounded-t-[30px] bg-white p-4 shadow-2xl sm:rounded-[30px]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-[#1f5f98]">
                  {t.redeemNow}
                </h3>
                <p className="text-xs font-bold text-gray-500">
                  {Number(setting?.redeemPoint || 0).toLocaleString("en-US")}{" "}
                  Point = {money(setting?.redeemMoney)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#f5f8fc] text-[#1f5f98] transition hover:bg-[#e8f1fb]"
              >
                <X size={22} />
              </button>
            </div>

            <label className="mb-4 block">
              <span className="mb-2 block text-sm font-black text-[#1f5f98]">
                {t.redeemAmount}
              </span>

              <input
                type="number"
                min="0"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                className="h-12 w-full rounded-2xl border border-[#2f79c9]/20 bg-[#f5f8fc] px-4 text-lg font-black text-[#1f5f98] outline-none focus:border-[#2f79c9]"
                placeholder="100"
              />
            </label>

            <div className="mb-4 space-y-2 rounded-2xl bg-[#f5f8fc] p-4">
              <SummaryRow
                label={t.points}
                value={points.toLocaleString("en-US")}
              />
              <SummaryRow
                label={t.requiredPoints}
                value={requiredPoints.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              />
              <SummaryRow
                label={t.afterRedeem}
                value={pointsAfterRedeem.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
                danger={pointsAfterRedeem < 0}
              />
              <SummaryRow label={t.redeemAmount} value={money(enteredAmount)} />
            </div>

            {!canRedeem && enteredAmount > 0 && (
              <p className="mb-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {isBangla
                  ? "আপনার পয়েন্ট, মিনিমাম/ম্যাক্সিমাম অথবা এমাউন্ট সঠিক নয়।"
                  : "Your points, minimum/maximum limit, or amount is not valid."}
              </p>
            )}

            <button
              type="button"
              onClick={handleRedeem}
              disabled={!canRedeem || redeeming}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#f07a2a] text-[16px] font-black text-white transition hover:bg-[#d9651e] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Wallet size={18} />
              {redeeming
                ? isBangla
                  ? "রিডিম হচ্ছে..."
                  : "Redeeming..."
                : t.redeemNow}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  return (
    <div className="rounded-[18px] border border-[#2f79c9]/15 bg-white p-3 text-center shadow-sm">
      <div className="mx-auto mb-2 flex justify-center" style={{ color }}>
        {icon}
      </div>
      <p className="text-[16px] font-black text-[#1f5f98]">{value}</p>
      <p className="text-[11px] font-bold text-gray-500">{label}</p>
    </div>
  );
};

const SummaryRow = ({ label, value, danger }) => {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-bold text-gray-500">{label}</span>
      <span
        className={`font-black ${danger ? "text-red-600" : "text-[#1f5f98]"}`}
      >
        {value}
      </span>
    </div>
  );
};

export default Share;

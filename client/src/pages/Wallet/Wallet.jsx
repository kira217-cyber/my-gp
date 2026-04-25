import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Wallet as WalletIcon,
  User,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  BadgePercent,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";
import { useLanguage } from "../../Context/LanguageProvider";

const InfoRow = ({
  icon,
  label,
  value,
  rightAction = null,
  valueClass = "",
}) => {
  return (
    <div className="rounded-[18px] border border-[#2f79c9]/15 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-[#2f79c9]">
        <span className="shrink-0">{icon}</span>
        <span className="text-sm font-extrabold">{label}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div
          className={`min-w-0 break-all text-[20px] font-black text-[#1f5f98] ${valueClass}`}
        >
          {value}
        </div>
        {rightAction}
      </div>
    </div>
  );
};

const Wallet = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const authUser = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [loading, setLoading] = useState(true);
  const [reloadingBalance, setReloadingBalance] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const [walletData, setWalletData] = useState({
    userId: authUser?.userId || "",
    balance: Number(authUser?.balance || 0),
    referralCode: authUser?.referralCode || "",
    phone: authUser?.phone || "",
  });
  const referralLink = `${import.meta.env.VITE_CLIENT_URL}/register?ref=${walletData?.referralCode || ""}`;

  const t = {
    title: isBangla ? "ওয়ালেট" : "Wallet",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    loginFirst: isBangla ? "আগে লগইন করুন" : "Please login first.",
    failed: isBangla
      ? "ওয়ালেট ডাটা লোড করা যায়নি"
      : "Failed to load wallet data.",
    reloadSuccess: isBangla
      ? "ব্যালেন্স রিফ্রেশ হয়েছে"
      : "Balance reloaded successfully.",
    availableBalance: isBangla ? "এভেইলেবল ব্যালেন্স" : "Available Balance",
    account: isBangla ? "অ্যাকাউন্ট" : "Account",
    userId: isBangla ? "ইউজার আইডি" : "User ID",
    balance: isBangla ? "ব্যালেন্স" : "Balance",
    referralCode: isBangla ? "রেফারেল কোড" : "Referral Code",
    copy: isBangla ? "কপি" : "Copy",
    copied: isBangla ? "কপি হয়েছে" : "Copied",
    noReferral: isBangla
      ? "রেফারেল কোড পাওয়া যায়নি"
      : "Referral code not found.",
    copyFailed: isBangla ? "কপি করা যায়নি" : "Failed to copy referral code.",
    currency: "TK",
  };

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(t.loginFirst);
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const fetchWalletData = async (isReload = false) => {
    if (!isAuthenticated) return;

    try {
      if (isReload) setReloadingBalance(true);
      else setLoading(true);

      const [balanceRes, meRes] = await Promise.allSettled([
        api.get("/api/users/me/balance"),
        api.get("/api/users/me"),
      ]);

      const balanceData =
        balanceRes.status === "fulfilled" ? balanceRes.value?.data?.data : {};

      const meData =
        meRes.status === "fulfilled"
          ? meRes.value?.data?.user || meRes.value?.data?.data || {}
          : {};

      setWalletData({
        userId: balanceData?.userId || meData?.userId || authUser?.userId || "",
        balance: Number(
          balanceData?.balance ?? meData?.balance ?? authUser?.balance ?? 0,
        ),
        referralCode: meData?.referralCode || authUser?.referralCode || "",
        phone: meData?.phone || authUser?.phone || "", // ✅ add this
      });

      if (isReload) toast.success(t.reloadSuccess);
    } catch (error) {
      toast.error(error?.response?.data?.message || t.failed);
    } finally {
      setLoading(false);
      setReloadingBalance(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [isAuthenticated]);

  const formattedBalance = useMemo(() => {
    const amount = Number(walletData?.balance || 0);
    return `${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${t.currency}`;
  }, [walletData?.balance, t.currency]);

  const handleCopyReferralCode = async () => {
    if (!walletData?.referralCode) {
      toast.error(t.noReferral);
      return;
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied.");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(t.copyFailed);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8fc] px-4">
        <div className="flex items-center gap-3 text-base font-bold text-[#2f79c9]">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t.loading}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-[#1f2937]">
      <div className="sticky top-0 z-30 flex h-[66px] items-center justify-center bg-[#2f79c9] px-4 shadow-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>

        <h1 className="text-[22px] font-black text-white sm:text-[25px]">
          {t.title}
        </h1>
      </div>

      <div className="mx-auto w-full max-w-[560px] px-3 pb-8 pt-4 sm:px-4">
        <div className="mb-5 rounded-[26px] bg-[#2f79c9] p-5 text-white shadow-lg">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f07a2a] text-white shadow-sm">
              <WalletIcon size={26} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white/80">
                {t.availableBalance}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 className="text-[28px] font-black tracking-tight text-white">
                  {showBalance ? formattedBalance : `•••••• ${t.currency}`}
                </h2>

                <button
                  type="button"
                  onClick={() => setShowBalance((prev) => !prev)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                >
                  {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                <button
                  type="button"
                  onClick={() => fetchWalletData(true)}
                  disabled={reloadingBalance}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <RefreshCw
                    size={18}
                    className={reloadingBalance ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
              {t.account}
            </p>
            <p className="mt-1 break-all text-[17px] font-black text-white">
              {walletData?.phone || "N/A"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <InfoRow
            icon={<User size={18} />}
            label={t.userId}
            value={walletData?.userId || "N/A"}
          />

          <InfoRow
            icon={<WalletIcon size={18} />}
            label={t.balance}
            value={showBalance ? formattedBalance : `•••••• ${t.currency}`}
            rightAction={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBalance((prev) => !prev)}
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#2f79c9] text-white transition hover:bg-[#1f5f98] active:scale-[0.98]"
                >
                  {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                <button
                  type="button"
                  onClick={() => fetchWalletData(true)}
                  disabled={reloadingBalance}
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#f07a2a] text-white transition hover:bg-[#d9651e] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <RefreshCw
                    size={18}
                    className={reloadingBalance ? "animate-spin" : ""}
                  />
                </button>
              </div>
            }
          />

          <InfoRow
            icon={<BadgePercent size={18} />}
            label={t.referralCode}
            value={referralLink || "N/A"}
            valueClass="text-[12px] sm:text-[16px] font-semibold text-[#f07a2a] break-all leading-tight"
            rightAction={
              <button
                type="button"
                onClick={handleCopyReferralCode}
                className="inline-flex h-10 min-w-[92px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#f07a2a] px-3 text-sm font-black text-white transition hover:bg-[#d9651e] active:scale-[0.98]"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t.copied : t.copy}
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Wallet;

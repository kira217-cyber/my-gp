import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Eye,
  EyeOff,
  Wallet,
  User,
  Lock,
  Inbox,
  MessageCircle,
  Mail,
  LogOut,
  X,
  Landmark,
  ReceiptText,
  ClipboardList,
  TrendingUp,
  Gift,
  BarChart3,
  FileText,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";
import { logout } from "../../features/auth/authSlice";
import {
  selectUser,
  selectIsAuthenticated,
} from "../../features/auth/authSelectors";

const PRIMARY = "#2f79c9";
const PRIMARY_DARK = "#1f5f98";
const SECONDARY = "#f07a2a";

const Account = () => {
  const { isBangla } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authUser = useSelector(selectUser);
  const isAuthed = useSelector(selectIsAuthenticated);

  const [balance, setBalance] = useState(Number(authUser?.balance || 0));
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  const t = {
    account: isBangla ? "অ্যাকাউন্ট" : "Account",
    userId: isBangla ? "ইউজার আইডি" : "User ID",
    fullName: isBangla ? "পূর্ণ নাম" : "Full Name",
    phone: isBangla ? "ফোন" : "Phone",
    guest: isBangla ? "গেস্ট" : "Guest",
    balance: isBangla ? "ব্যালেন্স" : "Balance",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    currency: "TK",

    funds: isBangla ? "ফান্ডস" : "Funds",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    withdraw: isBangla ? "উইথড্র" : "Withdraw",
    wallet: isBangla ? "ওয়ালেট" : "Wallet",
    dispute: isBangla ? "ডিসপিউট" : "Dispute",

    myPL: isBangla ? "আমার P&L" : "My P&L",
    turnover: isBangla ? "টার্নওভার" : "Turnover",
    rewards: isBangla ? "রিওয়ার্ডস" : "Rewards",
    pl: isBangla ? "পি&এল" : "P&L",

    history: isBangla ? "হিস্টোরি" : "History",
    betHistory: isBangla ? "বেট হিস্টোরি" : "Bet History",
    withdrawHistory: isBangla ? "উইথড্র হিস্টোরি" : "Withdraw History",
    depositHistory: isBangla ? "ডিপোজিট হিস্টোরি" : "Deposit History",

    profile: isBangla ? "প্রোফাইল" : "Profile",
    personalInfo: isBangla ? "ব্যক্তিগত তথ্য" : "Personal Info",
    resetPassword: isBangla ? "পাসওয়ার্ড রিসেট" : "Reset Password",
    inbox: isBangla ? "ইনবক্স" : "Inbox",

    contact: isBangla ? "যোগাযোগ" : "Contact",
    whatsapp: isBangla ? "হোয়াটসঅ্যাপ" : "WhatsApp",
    email: isBangla ? "ইমেইল" : "Email",

    logout: isBangla ? "লগ আউট" : "Log out",
    loginFirst: isBangla ? "আগে লগইন করুন" : "Please login first",
    logoutSuccess: isBangla ? "সফলভাবে লগআউট হয়েছে" : "Logged out successfully",
    balanceError: isBangla
      ? "ব্যালেন্স লোড করা যায়নি"
      : "Failed to load balance",
  };

  const formatAmount = (value) => {
    const num = Number(value || 0);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fetchBalance = async () => {
    if (!isAuthed) return;

    try {
      setLoadingBalance(true);
      const res = await api.get("/api/users/me/balance");

      if (res?.data?.success) {
        setBalance(Number(res.data?.data?.balance || 0));
      }
    } catch (error) {
      console.error("Balance fetch error:", error);
      toast.error(error?.response?.data?.message || t.balanceError);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [isAuthed]);

  const userId = authUser?.userId || t.guest;
  const fullName =
    `${authUser?.firstName || ""} ${authUser?.lastName || ""}`.trim() ||
    authUser?.name ||
    userId;

  const phone = authUser?.phone || "N/A";

  const fundsItems = useMemo(
    () => [
      { title: t.deposit, icon: Wallet, to: "/auto-deposit" },
      { title: t.withdraw, icon: Landmark, to: "/withdraw" },
      { title: t.wallet, icon: Wallet, to: "/wallet" },
      { title: t.dispute, icon: AlertCircle, to: "/dispute" },
    ],
    [t],
  );

  const plItems = useMemo(
    () => [
      {
        title: t.turnover,
        icon: TrendingUp,
        to: "/history/turnover-history",
      },
      { title: t.rewards, icon: Gift, to: "/rewards" },
      { title: t.pl, icon: BarChart3, to: "/pl" },
    ],
    [t],
  );

  const historyItems = useMemo(
    () => [
      {
        title: t.betHistory,
        icon: ClipboardList,
        to: "/history/bet-history",
      },
      {
        title: t.withdrawHistory,
        icon: ReceiptText,
        to: "/history/withdraw-history",
      },
      {
        title: t.depositHistory,
        icon: FileText,
        to: "/history/deposit-history",
      },
    ],
    [t],
  );

  const profileItems = useMemo(
    () => [
      { title: t.personalInfo, icon: User, to: "/personal-info" },
      { title: t.resetPassword, icon: Lock, to: "/reset-password" },
      { title: t.inbox, icon: Inbox, to: "/inbox" },
    ],
    [t],
  );

  const contactItems = useMemo(
    () => [
      {
        title: t.whatsapp,
        icon: MessageCircle,
        to: "https://whatsapp.com/",
        external: true,
      },
      {
        title: t.email,
        icon: Mail,
        to: "https://mail.google.com/",
        external: true,
      },
    ],
    [t],
  );

  const handleLogout = () => {
    dispatch(logout());
    toast.success(t.logoutSuccess);
    navigate("/");
  };

  const Section = ({ title, children }) => (
    <div className="overflow-hidden rounded-[18px] border border-[#2f79c9]/15 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#2f79c9]/10 px-4 py-3">
        <span
          className="h-6 w-[6px] rounded-full"
          style={{ backgroundColor: SECONDARY }}
        />
        <h3 className="text-[18px] font-extrabold text-[#1f5f98]">{title}</h3>
      </div>
      {children}
    </div>
  );

  const MenuGrid = ({ items, columns = 3 }) => (
    <div
      className={`grid gap-3 p-3 ${
        columns === 4
          ? "grid-cols-4"
          : columns === 2
            ? "grid-cols-2"
            : "grid-cols-3"
      }`}
    >
      {items.map((item, index) => {
        const Icon = item.icon;

        const content = (
          <>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2f79c9] text-white shadow-sm transition group-hover:scale-105 group-hover:bg-[#1f5f98] sm:h-14 sm:w-14">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.3} />
            </div>

            <span className="mt-2 min-h-[32px] text-center text-[12px] font-extrabold leading-tight text-[#1f5f98] sm:text-[14px]">
              {item.title}
            </span>
          </>
        );

        if (item.external) {
          return (
            <a
              key={index}
              href={item.to}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-center justify-start rounded-xl p-1 transition hover:bg-[#2f79c9]/5"
            >
              {content}
            </a>
          );
        }

        return (
          <NavLink
            key={index}
            to={item.to}
            className="group flex flex-col items-center justify-start rounded-xl p-1 transition hover:bg-[#2f79c9]/5"
          >
            {content}
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-[#1f2937]">
      {/* Header */}
      <div className="relative overflow-hidden rounded-b-[28px] bg-[#2f79c9] px-4 pb-7 pt-5 text-white shadow-lg">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
        >
          <X className="h-6 w-6" strokeWidth={2.5} />
        </button>

        <div className="absolute -left-10 -top-14 h-36 w-36 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -right-10 h-44 w-44 rounded-full bg-[#f07a2a]/40" />

        <div className="relative z-10 flex flex-col items-center pt-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-[#f07a2a] text-white shadow-lg">
            <span className="text-[42px] font-black leading-none">
              {String(userId || "U")
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>

          <h2 className="mt-3 rounded-full bg-white px-4 py-1.5 text-[18px] font-black text-[#2f79c9]">
            {t.userId}: {userId}
          </h2>

          <p className="mt-2 text-center text-[15px] font-bold text-white">
            {t.phone}: {phone}
          </p>
        </div>
      </div>

      <div className="space-y-3 px-3 py-3">
        {/* Balance Card */}
        <div className="rounded-[22px] border border-[#f07a2a] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-[#f07a2a] text-white shadow-sm">
                <span className="text-[34px] font-black leading-none">৳</span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[18px] font-extrabold leading-none text-[#f07a2a]">
                    {t.balance}
                  </h3>

                  <button
                    type="button"
                    onClick={() => setHideBalance((prev) => !prev)}
                    className="cursor-pointer text-[#2f79c9]"
                  >
                    {hideBalance ? (
                      <EyeOff className="h-4 w-4" strokeWidth={2.4} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={2.4} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={fetchBalance}
                    disabled={loadingBalance}
                    className={`cursor-pointer text-[#2f79c9] transition ${
                      loadingBalance ? "animate-spin opacity-70" : ""
                    }`}
                  >
                    <RefreshCw className="h-4 w-4" strokeWidth={2.4} />
                  </button>
                </div>

                <p className="mt-1 truncate text-[21px] font-black leading-none text-[#f07a2a] sm:text-[24px]">
                  {loadingBalance
                    ? t.loading
                    : hideBalance
                      ? `•••••• ${t.currency}`
                      : `${formatAmount(balance)} ${t.currency}`}
                </p>
              </div>
            </div>

            <div className="flex w-[125px] shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate("/deposit")}
                className="h-[40px] cursor-pointer rounded-[10px] bg-[#2f79c9] text-[15px] font-extrabold text-white shadow-sm transition hover:bg-[#1f5f98]"
              >
                {t.deposit}
              </button>

              <button
                type="button"
                onClick={() => navigate("/withdraw")}
                className="h-[40px] cursor-pointer rounded-[10px] bg-[#2f79c9] text-[15px] font-extrabold text-white shadow-sm transition hover:bg-[#1f5f98]"
              >
                {t.withdraw}
              </button>
            </div>
          </div>
        </div>

        <Section title={t.funds}>
          <MenuGrid items={fundsItems} columns={4} />
        </Section>

        <Section title={t.myPL}>
          <MenuGrid items={plItems} columns={3} />
        </Section>

        <Section title={t.history}>
          <MenuGrid items={historyItems} columns={3} />
        </Section>

        <Section title={t.profile}>
          <MenuGrid items={profileItems} columns={3} />
        </Section>

        <Section title={t.contact}>
          <MenuGrid items={contactItems} columns={2} />
        </Section>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] bg-[#f07a2a] px-4 py-4 text-[18px] font-black text-white shadow-sm transition hover:bg-[#d9651e]"
        >
          <LogOut className="h-5 w-5" strokeWidth={2.4} />
          <span>{t.logout}</span>
          <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
};

export default Account;

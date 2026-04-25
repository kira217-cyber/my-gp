import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ArrowLeft, RefreshCw, Eye, EyeOff } from "lucide-react";
import { api } from "../api/axios";
import {
  selectIsAuthenticated,
  selectUser,
} from "../features/auth/authSelectors";
import { useLanguage } from "../Context/LanguageProvider";
import HistoryNavbar from "../components/HistoryNavbar/HistoryNavbar";

const HistoryLayout = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const authUser = useSelector(selectUser);
  const isAuthed = useSelector(selectIsAuthenticated);

  const [balance, setBalance] = useState(Number(authUser?.balance || 0));
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const t = {
    wallet: isBangla ? "রিয়েল ওয়ালেট" : "REAL WALLET",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    failed: isBangla ? "ব্যালেন্স লোড করা যায়নি" : "Failed to load balance",
    currency: "TK",
    exposure: "Exp",
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
      toast.error(error?.response?.data?.message || t.failed);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [isAuthed]);

  return (
    <div className="min-h-screen bg-[#f5f8fc]">
      {/* Top Wallet Header */}
      <div className="sticky top-0 z-40 w-full bg-white shadow-sm">
        <div className="flex h-[64px] w-full items-center justify-between gap-2 border-b border-[#2f79c9]/15 bg-white px-3">
          {/* Left */}
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/account")}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#2f79c9] text-white shadow-sm transition hover:bg-[#1f5f98]"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>

            <h2 className="truncate text-[15px] font-black uppercase tracking-wide text-[#2f79c9] sm:text-[20px]">
              {t.wallet}
            </h2>
          </div>

          {/* Right */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={fetchBalance}
              disabled={loadingBalance}
              className={`flex h-8 w-8 items-center justify-center rounded-full bg-[#2f79c9]/10 text-[#2f79c9] ${
                loadingBalance ? "opacity-70" : "cursor-pointer"
              }`}
            >
              <RefreshCw
                className={`h-4 w-4 ${loadingBalance ? "animate-spin" : ""}`}
                strokeWidth={2.4}
              />
            </button>

            <button
              type="button"
              onClick={() => setShowBalance((prev) => !prev)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#2f79c9]/10 text-[#2f79c9]"
            >
              {showBalance ? (
                <Eye className="h-4 w-4" strokeWidth={2.4} />
              ) : (
                <EyeOff className="h-4 w-4" strokeWidth={2.4} />
              )}
            </button>

            <div className="rounded-full bg-[#f07a2a]/10 px-2.5 py-1 text-[13px] font-black text-[#f07a2a] sm:text-[16px]">
              {loadingBalance
                ? t.loading
                : showBalance
                  ? `${formatAmount(balance)} ${t.currency}`
                  : `•••••• ${t.currency}`}
            </div>

            <div className="rounded-full bg-[#f07a2a] px-2.5 py-1 text-[12px] font-black leading-none text-white sm:text-[14px]">
              {t.exposure} -0
            </div>
          </div>
        </div>

        <HistoryNavbar />
      </div>

      {/* Page Content */}
      <div className="pb-4">
        <Outlet />
      </div>
    </div>
  );
};

export default HistoryLayout;

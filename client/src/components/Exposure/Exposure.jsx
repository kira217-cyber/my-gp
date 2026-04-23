import React, { useEffect, useState } from "react";
import { RotateCw, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const Exposure = ({ balance: initialBalance = 0, exposure = 0 }) => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const [hideBalance, setHideBalance] = useState(false);
  const [balance, setBalance] = useState(initialBalance);
  const [loading, setLoading] = useState(false);

  const t = {
    balance: isBangla ? "ব্যালেন্স" : "Balance",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    withdraw: isBangla ? "উইথড্র" : "Withdraw",
    exposure: isBangla ? "এক্সপোজার" : "EXPOSURE",
    currency: "TK",
  };

  const formatAmount = (value) => {
    const num = Number(value || 0);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 🔥 fetch balance from API
  const fetchBalance = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/users/me/balance");

      if (res?.data?.success) {
        setBalance(res.data.data.balance || 0);
      }
    } catch (err) {
      console.error("Balance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 initial load
  useEffect(() => {
    fetchBalance();
  }, []);

  const handleReload = () => {
    fetchBalance();
  };

  return (
    <div className="w-full p-3">
      <div className="rounded-[20px] border border-[#f07a2a] bg-[#f6f6f6] p-4 shadow-sm">
        {/* Top */}
        <div className="flex items-start justify-between gap-3">
          {/* Left balance */}
          <div className="flex items-center gap-3">
            <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#f07a2a] text-white shadow-sm">
              <span className="text-[34px] font-black leading-none">৳</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] font-extrabold leading-none text-[#ef7126]">
                  {t.balance}
                </h3>

                <button
                  type="button"
                  onClick={() => setHideBalance((prev) => !prev)}
                  className="cursor-pointer text-[#1f5f98]"
                >
                  {hideBalance ? (
                    <EyeOff className="h-4 w-4" strokeWidth={2.4} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={2.4} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReload}
                  className={`cursor-pointer text-[#1f5f98] transition ${
                    loading ? "animate-spin" : ""
                  }`}
                >
                  <RotateCw className="h-4 w-4" strokeWidth={2.4} />
                </button>
              </div>

              <p className="mt-1 text-[20px] font-extrabold leading-none text-[#ef7126] sm:text-[22px]">
                {hideBalance
                  ? "••••••"
                  : `${formatAmount(balance)} ${t.currency}`}
              </p>
            </div>
          </div>

          {/* Right buttons */}
          <div className="flex w-[145px] flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate("/deposit")}
              className="h-[42px] rounded-[10px] bg-[#2f79c9] text-[16px] font-extrabold text-white shadow-sm transition hover:bg-[#1f5f98] cursor-pointer"
            >
              {t.deposit}
            </button>

            <button
              type="button"
              onClick={() => navigate("/withdraw")}
              className="h-[42px] rounded-[10px] bg-[#2f79c9] text-[16px] font-extrabold text-white shadow-sm transition hover:bg-[#1f5f98] cursor-pointer"
            >
              {t.withdraw}
            </button>
          </div>
        </div>

        {/* Bottom exposure */}
        <div className="mt-4 rounded-[10px] bg-[#eee8d7] px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="rounded-[10px] bg-[#2f79c9] px-3 py-1.5 text-[22px] font-extrabold leading-none text-white">
              {t.exposure}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#f07a2a] text-white shadow-sm">
                <span className="text-[28px] font-black leading-none">৳</span>
              </div>

              <p className="text-[24px] font-extrabold leading-none text-[#ef7126]">
                {formatAmount(exposure)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exposure;

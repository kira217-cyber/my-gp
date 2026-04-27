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
    mainBalance: isBangla ? "মেইন ব্যালেন্স" : "Main Balance",
    expoBalance: isBangla ? "এক্সপো ব্যালেন্স" : "Expo Balance",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    withdraw: isBangla ? "উইথড্র" : "Withdraw",
    currency: "TK",
  };

  const formatAmount = (value) => {
    const num = Number(value || 0);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

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

  useEffect(() => {
    fetchBalance();
  }, []);

  const amountText = hideBalance
    ? "••••••"
    : `${formatAmount(balance)} ${t.currency}`;

  const expoText = hideBalance
    ? "••••••"
    : `${formatAmount(exposure)} ${t.currency}`;

  return (
    <div className="w-full px-2 py-2">
      <div className="rounded-[16px] border border-white/70 bg-[#3789d7] px-6 py-8 shadow-md">
        <div className="space-y-8">
          {/* Main Balance Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#062f76] text-white shadow-sm">
                <span className="text-[24px] font-black leading-none">৳</span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-[17px] font-black leading-none text-white drop-shadow-sm">
                    {t.mainBalance}
                  </h3>

                  <button
                    type="button"
                    onClick={() => setHideBalance((prev) => !prev)}
                    className="cursor-pointer text-white/90"
                  >
                    {hideBalance ? (
                      <EyeOff className="h-3.5 w-3.5" strokeWidth={2.5} />
                    ) : (
                      <Eye className="h-3.5 w-3.5" strokeWidth={2.5} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={fetchBalance}
                    className={`cursor-pointer text-white/90 transition ${
                      loading ? "animate-spin" : ""
                    }`}
                  >
                    <RotateCw className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </div>

                <p className="mt-1 text-[20px] font-black leading-none text-white drop-shadow-sm">
                  {amountText}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/auto-personal-deposit")}
              className="h-[42px] min-w-[100px] shrink-0 cursor-pointer rounded-[10px] border border-white/40 bg-[#072f77] px-6 text-[20px] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:bg-[#052764]"
            >
              {t.deposit}
            </button>
          </div>

          {/* Exposure Balance Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#062f76] text-white shadow-sm">
                <span className="text-[24px] font-black leading-none">৳</span>
              </div>

              <div className="min-w-0">
                <h3 className="text-[17px] font-black leading-none text-white drop-shadow-sm">
                  {t.expoBalance}
                </h3>

                <p className="mt-1 text-[20px] font-black leading-none text-white drop-shadow-sm">
                  {expoText}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/withdraw")}
              className="h-[42px] min-w-[100px] shrink-0 cursor-pointer rounded-[10px] border border-white/40 bg-[#ff1010] px-3 text-[20px] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:bg-[#dc0b0b]"
            >
              {t.withdraw}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exposure;

import React from "react";
import { NavLink } from "react-router";
import { Home, Wallet, Share2, Landmark, User } from "lucide-react";
import bg from "../../assets/bottomBg.png";
import { useLanguage } from "../../Context/LanguageProvider";

const BottomNavbar = () => {
  const { isBangla } = useLanguage();

  const t = {
    home: isBangla ? "হোম" : "Home",
    deposit: isBangla ? "জমা" : "Deposit",
    share: isBangla ? "শেয়ার" : "Share",
    withdraw: isBangla ? "উত্তোলন" : "Withdraw",
    account: isBangla ? "অ্যাকাউন্ট" : "Account",
  };

  // 🔵 your site base color
  const activeColor = "#1B5487";
  const inactiveColor = "#2F79C9";

  return (
    <>
      {" "}
      <div
        className="fixed bottom-0 left-1/2 z-40 flex h-[120px] w-full max-w-[480px] -translate-x-1/2 items-end justify-around bg-cover bg-center pb-2"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundPosition: "center",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Home */}
        <NavLink to="/" className="flex flex-col items-center text-xs">
          {({ isActive }) => (
            <>
              <div
                className="mb-1 flex h-[38px] w-[38px] items-center justify-center rounded-full"
                style={{
                  backgroundColor: isActive ? activeColor : inactiveColor,
                }}
              >
                <Home
                  className="h-[20px] w-[20px] text-white"
                  strokeWidth={2.5}
                />
              </div>

              <span
                style={{ color: isActive ? activeColor : inactiveColor }}
                className="text-[12px] font-semibold"
              >
                {t.home}
              </span>
            </>
          )}
        </NavLink>

        {/* Deposit */}
        <NavLink to="/deposit" className="flex flex-col items-center text-xs">
          {({ isActive }) => (
            <>
              <div
                className="mb-1 flex h-[38px] w-[38px] items-center justify-center rounded-full"
                style={{
                  backgroundColor: isActive ? activeColor : inactiveColor,
                }}
              >
                <Wallet className="h-[20px] w-[20px] text-white" />
              </div>

              <span
                style={{ color: isActive ? activeColor : inactiveColor }}
                className="text-[12px] font-semibold"
              >
                {t.deposit}
              </span>
            </>
          )}
        </NavLink>

        {/* Share (center) */}
        <NavLink to="/invite-friends" className="cursor-pointer">
          <div className="relative -top-2 flex flex-col items-center">
            <img
              src="https://melbets.live/assets/footer-invite-gdwLcv1n.png"
              alt="Share"
              className="w-[71px] drop-shadow-lg"
            />

            <p
              className="mt-4 text-xs font-bold"
              style={{ color: inactiveColor }}
            >
              {t.share}
            </p>
          </div>
        </NavLink>

        {/* Withdraw */}
        <NavLink to="/withdraw" className="flex flex-col items-center text-xs">
          {({ isActive }) => (
            <>
              <div
                className="mb-1 flex h-[38px] w-[38px] items-center justify-center rounded-full"
                style={{
                  backgroundColor: isActive ? activeColor : inactiveColor,
                }}
              >
                <Landmark className="h-[20px] w-[20px] text-white" />
              </div>

              <span
                style={{ color: isActive ? activeColor : inactiveColor }}
                className="text-[12px] font-semibold"
              >
                {t.withdraw}
              </span>
            </>
          )}
        </NavLink>

        {/* Account */}
        <NavLink to="/account" className="flex flex-col items-center text-xs">
          {({ isActive }) => (
            <>
              <div
                className="mb-1 flex h-[38px] w-[38px] items-center justify-center rounded-full"
                style={{
                  backgroundColor: isActive ? activeColor : inactiveColor,
                }}
              >
                <User className="h-[20px] w-[20px] text-white" />
              </div>

              <span
                style={{ color: isActive ? activeColor : inactiveColor }}
                className="text-[12px] font-semibold"
              >
                {t.account}
              </span>
            </>
          )}
        </NavLink>
      </div>
    </>
  );
};

export default BottomNavbar;

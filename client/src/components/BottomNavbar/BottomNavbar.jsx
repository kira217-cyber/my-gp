import React from "react";
import { NavLink } from "react-router";
import { Home, Wallet, Landmark, User } from "lucide-react";
import bg from "../../assets/bottomBg.png";
import { useLanguage } from "../../Context/LanguageProvider";
import share from "../../assets/share.png";
const BottomNavbar = () => {
  const { isBangla } = useLanguage();

  const t = {
    home: isBangla ? "হোম" : "Home",
    deposit: isBangla ? "জমা" : "Deposit",
    share: isBangla ? "শেয়ার" : "Share",
    withdraw: isBangla ? "উত্তোলন" : "Withdraw",
    account: isBangla ? "অ্যাকাউন্ট" : "Account",
  };

  const activeColor = "#ffffff";
  const inactiveColor = "#cfe6ff";

  const activeBg = "#ffffff";
  const inactiveBg = "#2f79c9";

  const activeIconColor = "#2f79c9";
  const inactiveIconColor = "#ffffff";

  return (
    <div
      className="fixed bottom-0 left-1/2 z-40 flex h-[120px] w-full max-w-[480px] -translate-x-1/2 items-end justify-around bg-cover bg-center pb-2"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "100% 100%",
      }}
    >
      {/* Home */}
      <NavLink to="/" className="flex flex-col items-center">
        {({ isActive }) => (
          <>
            <div
              className="mb-1 flex h-[44px] w-[44px] items-center justify-center rounded-full shadow-md"
              style={{
                backgroundColor: isActive ? activeBg : inactiveBg,
              }}
            >
              <Home
                className="h-[22px] w-[22px]"
                strokeWidth={2.6}
                style={{
                  color: isActive ? activeIconColor : inactiveIconColor,
                }}
              />
            </div>

            <span
              style={{ color: isActive ? activeColor : inactiveColor }}
              className="text-[13px] font-bold"
            >
              {t.home}
            </span>
          </>
        )}
      </NavLink>

      {/* Deposit */}
      <NavLink to="/auto-personal-deposit" className="flex flex-col items-center">
        {({ isActive }) => (
          <>
            <div
              className="mb-1 flex h-[44px] w-[44px] items-center justify-center rounded-full shadow-md"
              style={{
                backgroundColor: isActive ? activeBg : inactiveBg,
              }}
            >
              <Wallet
                className="h-[22px] w-[22px]"
                strokeWidth={2.4}
                style={{
                  color: isActive ? activeIconColor : inactiveIconColor,
                }}
              />
            </div>

            <span
              style={{ color: isActive ? activeColor : inactiveColor }}
              className="text-[13px] font-bold"
            >
              {t.deposit}
            </span>
          </>
        )}
      </NavLink>

      {/* Share */}
      <NavLink to="/invite-friends">
        <div className="relative  flex flex-col items-center">
          <img
            src={share}
            alt="Share"
            className="w-[78px] drop-shadow-xl"
          />

          <p className="mt-4 text-[13px] font-bold text-[#cfe6ff]">{t.share}</p>
        </div>
      </NavLink>

      {/* Withdraw */}
      <NavLink to="/withdraw" className="flex flex-col items-center">
        {({ isActive }) => (
          <>
            <div
              className="mb-1 flex h-[44px] w-[44px] items-center justify-center rounded-full shadow-md"
              style={{
                backgroundColor: isActive ? activeBg : inactiveBg,
              }}
            >
              <Landmark
                className="h-[22px] w-[22px]"
                strokeWidth={2.4}
                style={{
                  color: isActive ? activeIconColor : inactiveIconColor,
                }}
              />
            </div>

            <span
              style={{ color: isActive ? activeColor : inactiveColor }}
              className="text-[13px] font-bold"
            >
              {t.withdraw}
            </span>
          </>
        )}
      </NavLink>

      {/* Account */}
      <NavLink to="/account" className="flex flex-col items-center">
        {({ isActive }) => (
          <>
            <div
              className="mb-1 flex h-[44px] w-[44px] items-center justify-center rounded-full shadow-md"
              style={{
                backgroundColor: isActive ? activeBg : inactiveBg,
              }}
            >
              <User
                className="h-[22px] w-[22px]"
                strokeWidth={2.4}
                style={{
                  color: isActive ? activeIconColor : inactiveIconColor,
                }}
              />
            </div>

            <span
              style={{ color: isActive ? activeColor : inactiveColor }}
              className="text-[13px] font-bold"
            >
              {t.account}
            </span>
          </>
        )}
      </NavLink>
    </div>
  );
};

export default BottomNavbar;


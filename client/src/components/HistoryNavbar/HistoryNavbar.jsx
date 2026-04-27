import React from "react";
import { NavLink } from "react-router";
import { Wallet, Gamepad2, RotateCcw, ReceiptText } from "lucide-react";
import { BiMoneyWithdraw } from "react-icons/bi";
import { MdHdrAuto } from "react-icons/md";

const navItems = [
  {
    name: "Deposit History",
    path: "/history/deposit-history",
    icon: Wallet,
  },
  {
    name: "Withdraw History",
    path: "/history/withdraw-history",
    icon: BiMoneyWithdraw,
  },
  {
    name: "Auto Deposit History",
    path: "/history/auto-personal-deposit-history",
    icon: MdHdrAuto,
  },
  {
    name: "Bet History",
    path: "/history/bet-history",
    icon: Gamepad2,
  },
  {
    name: "Turnover History",
    path: "/history/turnover-history",
    icon: RotateCcw,
  },
];

const HistoryNavbar = () => {
  return (
    <div className="w-full bg-white px-2 py-2">
      <div className="rounded-[8px] border border-[#2f79c9]/15 bg-[#f5f8fc] p-1.5 shadow-sm">
        <div
          className="flex cursor-grab items-center gap-1.5 overflow-x-auto scroll-smooth active:cursor-grabbing"
          style={{ scrollbarWidth: "none" }}
          onMouseDown={(e) => {
            const slider = e.currentTarget;
            slider.dataset.mouseDown = "true";
            slider.dataset.startX = e.pageX;
            slider.dataset.scrollLeft = slider.scrollLeft;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.dataset.mouseDown = "false";
          }}
          onMouseUp={(e) => {
            e.currentTarget.dataset.mouseDown = "false";
          }}
          onMouseMove={(e) => {
            const slider = e.currentTarget;
            if (slider.dataset.mouseDown !== "true") return;

            e.preventDefault();

            const startX = Number(slider.dataset.startX || 0);
            const scrollLeft = Number(slider.dataset.scrollLeft || 0);
            const walk = (e.pageX - startX) * 1.2;

            slider.scrollLeft = scrollLeft - walk;
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex h-[42px] min-w-max shrink-0 cursor-pointer items-center gap-2 rounded-[8px] px-4 text-[12px] font-extrabold whitespace-nowrap transition-all duration-200 sm:text-[14px] ${
                    isActive
                      ? "bg-[#2f79c9] text-white shadow-sm"
                      : "bg-white text-[#2f79c9] hover:bg-[#2f79c9]/10"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={17}
                      className={isActive ? "text-white" : "text-[#f07a2a]"}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoryNavbar;

import React, { useState } from "react";
import { Outlet, useLocation } from "react-router";
import Navber from "../components/Navber/Navber";
import Sidebar from "../components/Sidebar/Sidebar";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";
import SiteIdentity from "../components/SiteIdentity/SiteIdentity";
import SocialLink from "../components/SocialLink/SocialLink";
import bg from "../assets/bg.webp";
const RootLayout = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hideNavbarRoutes = [
    "/login",
    "/register",
    "/start",
    "/account",
    "/history",
    "/history/turnover-history",
    "/history/bet-history",
    "/auto-deposit-history",
    "/history/withdraw-history",
    "/history/deposit-history",
    "/history/turnover-history",
    "/history/auto-deposit-history",
    "/reset-password",
    "/wallet",
    "/personal-info",
    "/dispute",
    "/pl",
    "/inbox",
    "/rewards",
    "/history/auto-personal-deposit-history",
  ];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="h-screen flex justify-center bg-black overflow-hidden">
      {/* Desktop Background */}
      <div
        className="hidden lg:block fixed inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${bg})`,
        }}
      />

      {/* Mobile App Container */}
      <div className="relative z-10 w-full max-w-[480px] h-screen bg-[#1D5389] shadow-2xl overflow-hidden">
        {/* Navbar */}
        {!hideNavbar && <Navber setOpen={setOpen} />}
        <Sidebar open={open} setOpen={setOpen} />

        <div className="h-[calc(100%-0px)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Outlet />
          <SiteIdentity />
          <SocialLink />
        </div>
        {!hideNavbar && <BottomNavbar />}
      </div>
    </div>
  );
};

export default RootLayout;

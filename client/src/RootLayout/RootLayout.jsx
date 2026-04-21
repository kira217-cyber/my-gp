import React, { useState } from "react";
import { Outlet, useLocation } from "react-router";
import Navber from "../components/Navber/Navber";
import Sidebar from "../components/Sidebar/Sidebar";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";

const RootLayout = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/register", "/start"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="h-screen flex justify-center bg-black overflow-hidden">
      {/* Desktop Background */}
      <div
        className="hidden lg:block fixed inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://beit365.bet/assets/images/baaji365-desktop-bg.webp')",
        }}
      />

      {/* Mobile App Container */}
      <div className="relative z-10 w-full max-w-[480px] h-screen bg-white shadow-2xl overflow-hidden">
        {/* Navbar */}
        {!hideNavbar && <Navber setOpen={setOpen} />}
        <Sidebar open={open} setOpen={setOpen} />

        <div className="h-[calc(100%-64px)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Outlet />
        </div>
        {!hideNavbar && <BottomNavbar />}
      </div>
    </div>
  );
};

export default RootLayout;

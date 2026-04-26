import React from "react";
import { Outlet } from "react-router";
import Navber from "../components/Navber/Navber";
import Footer from "../components/Footer/Footer";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";
const RootLayout = () => {
  return (
    <div>
      <Navber />
      <Outlet />
      <BottomNavbar />
      <Footer />
      
    </div>
  );
};

export default RootLayout;

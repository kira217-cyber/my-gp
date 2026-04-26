import React from "react";
import { Outlet } from "react-router";
import Navber from "../components/Navber/Navber";
import Footer from "../components/Footer/Footer";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";
import AffSiteIdentity from "../components/AffSiteIdentity/AffSiteIdentity";
import AffSocialLink from "../components/AffSocialLink/AffSocialLink";
const RootLayout = () => {
  return (
    <div>
      <Navber />
      <Outlet />
      <AffSiteIdentity />
      <AffSocialLink />
      <BottomNavbar />
      <Footer />
    </div>
  );
};

export default RootLayout;

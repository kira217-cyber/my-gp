import { createBrowserRouter } from "react-router";

import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import AddWithdraw from "../pages/AddWithdraw/AddWithdraw";
import AddDeposit from "../pages/AddDeposit/AddDeposit";

import Profile from "../pages/Profile/Profile";
import CreateAdmin from "../pages/CreateAdmin/CreateAdmin";

import PrivateRoute from "../PrivateRoute/PrivateRoute";
import AllUsers from "../pages/AllUsers/AllUsers";
import AllAffiliateUsers from "../pages/AllAffiliateUsers/AllAffiliateUsers";
import BulkAdjustment from "../pages/BulkAdjustment/BulkAdjustment";
import UserDetails from "../pages/UserDetials/UserDetails";
import AffiliateUserDetials from "../pages/AffiliateUserDetails/AffiliateUserDetials";
import AddDepositMethod from "../pages/AddDepositMethod/AddDepositMethod";
import AddDepositBonusAndTurnover from "../pages/AddDepositBonusAndTurnover/AddDepositBonusAndTurnover";
import AddDepositField from "../pages/AddDepositField/AddDepositField";
import DepositRequest from "../pages/DepositRequest/DepositRequest";
import DepositRequestDetials from "../pages/DepositRequestDetials/DepositRequestDetials";
import WithdrawRequest from "../pages/WithdrawRequest/WithdrawRequest";
import WithdrawRequestDetials from "../pages/WithdrawRequestDetials/WithdrawRequestDetials";
import AutoDepositSettings from "../pages/AutoDepositSettings/AutoDepositSettings";
import AutoDepositHistory from "../pages/AutoDepositHistory/AutoDepositHistory";
import AffAddWithdraw from "../pages/AffAddWithdraw/AffAddWithdraw";
import AffWithdrawRequest from "../pages/AffWithdrawRequest/AffWithdrawRequest";
import AffWithdrawRequestDetails from "../pages/AffWithdrawRequestDetails/AffWithdrawRequestDetails";
import AddCategories from "../pages/AddCategories/AddCategories";
import AddProviders from "../pages/AddProviders/AddProviders";
import AddGames from "../pages/AddGames/AddGames";
import AddSports from "../pages/AddSports/AddSports";
import BetHistory from "../pages/BetHistory/BetHistory";
import SliderController from "../pages/SliderController/SliderController";
import AffSliderController from "../pages/AffSliderController/AffSliderController";
import SiteIdentityController from "../pages/SiteIdentityController/SiteIdentityController";
import AffSiteIdentityController from "../pages/AffSiteIdentityController/AffSiteIdentityController";
import AddSocialLink from "../pages/AddSocialLink/AddSocialLink";
import AddAffSocialLink from "../pages/AddAffSocialLink/AddAffSocialLink";
import AddAffNotice from "../pages/AddAffNotice/AddAffNotice";
import AutoPersonalDepositSettings from "../pages/AutoPersonalDepositSettings/AutoPersonalDepositSettings";
import AutoPersonalDepositHistory from "../pages/AutoPersonalDepositHistory/AutoPersonalDepositHistory";
import UserReferRedeem from "../pages/UserReferRedeem/UserReferRedeem";
import AllSuperAffiliates from "../pages/AllSuperAffiliates/AllSuperAffiliates";
import SuperAffiliateUserDetials from "../pages/SuperAffiliateUserDetials/SuperAffiliateUserDetials";
import SuperBulkAdjustment from "../pages/SuperBulkAdjustment/SuperBulkAdjustment";
import AddRegisterBonus from "../pages/AddRegisterBonus/AddRegisterBonus";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute permKey="dashboard">
        <RootLayout />
      </PrivateRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute permKey="dashboard">
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <PrivateRoute permKey="profile">
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "all-users",
        element: (
          <PrivateRoute permKey="all-users">
            <AllUsers />
          </PrivateRoute>
        ),
      },
      {
        path: "all-user-details/:id",
        element: (
          <PrivateRoute permKey="all-user-details">
            <UserDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "all-affiliate-users",
        element: (
          <PrivateRoute permKey="all-affiliate-users">
            <AllAffiliateUsers />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-user-details/:id",
        element: (
          <PrivateRoute permKey="affiliate-user-details">
            <AffiliateUserDetials />
          </PrivateRoute>
        ),
      },
      {
        path: "all-super-affiliate-users",
        element: (
          <PrivateRoute permKey="all-super-affiliate-users">
            <AllSuperAffiliates />
          </PrivateRoute>
        ),
      },
      {
        path: "super-affiliate-user-details/:id",
        element: (
          <PrivateRoute permKey="super-affiliate-user-details">
            <SuperAffiliateUserDetials />
          </PrivateRoute>
        ),
      },
      {
        path: "bulk-adjustment",
        element: (
          <PrivateRoute permKey="bulk-adjustment">
            <BulkAdjustment />
          </PrivateRoute>
        ),
      },
      {
        path: "super-bulk-adjustment",
        element: (
          <PrivateRoute permKey="super-bulk-adjustment">
            <SuperBulkAdjustment />
          </PrivateRoute>
        ),
      },
      {
        path: "/user-refer-redeem",
        element: (
          <PrivateRoute permKey="user-refer-redeem">
            <UserReferRedeem />
          </PrivateRoute>
        ),
      },
      {
        path: "add-register-bonus",
        element: (
          <PrivateRoute permKey="add-register-bonus">
            <AddRegisterBonus />
          </PrivateRoute>
        ),
      },
      {
        path: "add-game-categories",
        element: (
          <PrivateRoute permKey="add-game-categories">
            <AddCategories />
          </PrivateRoute>
        ),
      },
      {
        path: "add-providers",
        element: (
          <PrivateRoute permKey="add-providers">
            <AddProviders />
          </PrivateRoute>
        ),
      },
      {
        path: "add-games",
        element: (
          <PrivateRoute permKey="add-games">
            <AddGames />
          </PrivateRoute>
        ),
      },
      {
        path: "add-sports",
        element: (
          <PrivateRoute permKey="add-sports">
            <AddSports />
          </PrivateRoute>
        ),
      },
      {
        path: "bet-history",
        element: (
          <PrivateRoute permKey="bet-history">
            <BetHistory />
          </PrivateRoute>
        ),
      },
      {
        path: "/add-deposit-method",
        element: (
          <PrivateRoute permKey="add-deposit-method">
            <AddDepositMethod />
          </PrivateRoute>
        ),
      },
      {
        path: "/add-deposit-field",
        element: (
          <PrivateRoute permKey="add-deposit-field">
            <AddDepositField />
          </PrivateRoute>
        ),
      },
      {
        path: "/add-deposit-bonus-turnover",
        element: (
          <PrivateRoute permKey="add-deposit-bonus-turnover">
            <AddDepositBonusAndTurnover />
          </PrivateRoute>
        ),
      },
      {
        path: "/deposit-request",
        element: (
          <PrivateRoute permKey="deposit-request">
            <DepositRequest />
          </PrivateRoute>
        ),
      },
      {
        path: "/deposit-request/:id",
        element: (
          <PrivateRoute permKey="deposit-request-details">
            <DepositRequestDetials />
          </PrivateRoute>
        ),
      },
      // {
      //   path: "/auto-deposit-settings",
      //   element: (
      //     <PrivateRoute permKey="auto-deposit-settings">
      //       <AutoDepositSettings />
      //     </PrivateRoute>
      //   ),
      // },
      // {
      //   path: "/auto-deposit-history",
      //   element: (
      //     <PrivateRoute permKey="auto-deposit-history">
      //       <AutoDepositHistory />
      //     </PrivateRoute>
      //   ),
      // },
      {
        path: "/auto-personal-deposit-history",
        element: (
          <PrivateRoute permKey="auto-personal-deposit-history">
            <AutoPersonalDepositHistory />
          </PrivateRoute>
        ),
      },
      {
        path: "/auto-personal-deposit-settings",
        element: (
          <PrivateRoute permKey="auto-personal-deposit-settings">
            <AutoPersonalDepositSettings />
          </PrivateRoute>
        ),
      },
      {
        path: "add-withdraw",
        element: (
          <PrivateRoute permKey="add-withdraw">
            <AddWithdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "/withdraw-request",
        element: (
          <PrivateRoute permKey="withdraw-request">
            <WithdrawRequest />
          </PrivateRoute>
        ),
      },
      {
        path: "/withdraw-request/:id",
        element: (
          <PrivateRoute permKey="withdraw-request-detials">
            <WithdrawRequestDetials />
          </PrivateRoute>
        ),
      },
      {
        path: "/aff-add-withdraw",
        element: (
          <PrivateRoute permKey="aff-add-withdraw">
            <AffAddWithdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "/aff-withdraw-request",
        element: (
          <PrivateRoute permKey="aff-withdraw-request">
            <AffWithdrawRequest />
          </PrivateRoute>
        ),
      },
      {
        path: "/aff-withdraw-request-details/:id",
        element: (
          <PrivateRoute permKey="aff-withdraw-request-detials">
            <AffWithdrawRequestDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "create-admin",
        element: (
          <PrivateRoute motherOnly>
            <CreateAdmin />
          </PrivateRoute>
        ),
      },
      {
        path: "slider-controller",
        element: (
          <PrivateRoute permKey="slider-controller">
            <SliderController />
          </PrivateRoute>
        ),
      },
      {
        path: "add-social-link",
        element: (
          <PrivateRoute permKey="add-social-link">
            <AddSocialLink />
          </PrivateRoute>
        ),
      },
      {
        path: "add-aff-social-link",
        element: (
          <PrivateRoute permKey="add-aff-social-link">
            <AddAffSocialLink />
          </PrivateRoute>
        ),
      },
      {
        path: "add-aff-notice",
        element: (
          <PrivateRoute permKey="add-aff-notice">
            <AddAffNotice />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-slider-controller",
        element: (
          <PrivateRoute permKey="aff-slider-controller">
            <AffSliderController />
          </PrivateRoute>
        ),
      },
      {
        path: "site-identity-controller",
        element: (
          <PrivateRoute permKey="site-identity-controller">
            <SiteIdentityController />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-site-identity-controller",
        element: (
          <PrivateRoute permKey="aff-site-identity-controller">
            <AffSiteIdentityController />
          </PrivateRoute>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

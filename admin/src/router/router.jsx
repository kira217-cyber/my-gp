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
        path: "bulk-adjustment",
        element: (
          <PrivateRoute permKey="bulk-adjustment">
            <BulkAdjustment />
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
        path: "create-admin",
        element: (
          <PrivateRoute motherOnly>
            <CreateAdmin />
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

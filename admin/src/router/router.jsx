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
        path: "add-deposit",
        element: (
          <PrivateRoute permKey="add-deposit">
            <AddDeposit />
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

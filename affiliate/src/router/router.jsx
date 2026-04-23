import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Withdraw from "../pages/Withdraw/Withdraw";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import DashboardLayout from "../DashboardLayout/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import MyUsers from "../pages/MyUsers/MyUsers";
import CommissionStatus from "../pages/CommissionStatus/CommissionStatus";
import WithdrawHistory from "../pages/WithdrawHistory/WithdrawHistory";
import WithdrawHistoryDetails from "../pages/WithdrawHistoryDetails/WithdrawHistoryDetails";
import Profile from "../pages/Profile/Profile";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "withdraw",
        element: <Withdraw />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "withdraw-history",
        element: <WithdrawHistory />,
      },
      {
        path: "withdraw-history/:id",
        element: <WithdrawHistoryDetails />,
      },
      {
        path: "my-users",
        element: <MyUsers />,
      },
      {
        path: "commission-status",
        element: <CommissionStatus />,
      },
    ],
  },
]);

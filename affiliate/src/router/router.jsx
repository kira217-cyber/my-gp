import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Withdraw from "../pages/Withdraw/Withdraw";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import SuperPrivateRoute from "../PrivateRoute/SuperPrivateRoute";
import DashboardLayout from "../DashboardLayout/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import MyUsers from "../pages/MyUsers/MyUsers";
import CommissionStatus from "../pages/CommissionStatus/CommissionStatus";
import WithdrawHistory from "../pages/WithdrawHistory/WithdrawHistory";
import WithdrawHistoryDetails from "../pages/WithdrawHistoryDetails/WithdrawHistoryDetails";
import Profile from "../pages/Profile/Profile";
import SuperDashboardLayout from "../SuperDashboardLayout/SuperDashboardLayout";
import SuperDashboard from "../pages/SuperDashboard/SuperDashboard";
import SuperMyUsers from "../pages/SuperMyUsers/SuperMyUsers";
import SuperCommissionStatus from "../pages/SuperCommissionStatus/SuperCommissionStatus";
import SuperWithdraw from "../pages/SuperWithdraw/SuperWithdraw";
import SuperWithdrawHistory from "../pages/SuperWithdrawHistory/SuperWithdrawHistory";
import SuperWithdrawHistoryDetails from "../pages/SuperWithdrawHistoryDetails/SuperWithdrawHistoryDetails";
import SuperProfile from "../pages/SuperProfile/SuperProfile";
import AffAddWithdraw from "../pages/AffAddWithdraw/AffAddWithdraw";
import AffWithdrawRequest from "../pages/AffWithdrawRequest/AffWithdrawRequest";
import AffWithdrawRequestDetails from "../pages/AffWithdrawRequestDetails/AffWithdrawRequestDetails";

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
  {
    path: "/super-dashboard",
    element: (
      <SuperPrivateRoute>
        <SuperDashboardLayout />
      </SuperPrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <SuperDashboard />,
      },
      {
        path: "withdraw",
        element: <SuperWithdraw />,
      },
      {
        path: "profile",
        element: <SuperProfile />,
      },
      {
        path: "aff-add-withdraw",
        element: <AffAddWithdraw />,
      },
      {
        path: "aff-withdraw-request",
        element: <AffWithdrawRequest />,
      },
      {
        path: "aff-withdraw-request-details/:id",
        element: <AffWithdrawRequestDetails />,
      },
      {
        path: "withdraw-history",
        element: <SuperWithdrawHistory />,
      },
      {
        path: "withdraw-history/:id",
        element: <SuperWithdrawHistoryDetails />,
      },
      {
        path: "my-users",
        element: <SuperMyUsers />,
      },
      {
        path: "commission-status",
        element: <SuperCommissionStatus />,
      },
    ],
  },
]);

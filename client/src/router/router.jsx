import { createBrowserRouter, Navigate } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Deposit from "../pages/Deposit/Deposit";
import Withdraw from "../pages/Withdraw/Withdraw";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import FirstVisitRoute from "../components/FirstVisitRoute/FirstVisitRoute";
import Start from "../components/Start/Start";
import Games from "../pages/Games/Games";
import Account from "../pages/Account/Account";
import Share from "../pages/Share/Share";
import AutoDeposit from "../pages/AutoDeposit/AutoDeposit";
import PlayGame from "../pages/PlayGame/PlayGame";

import HistoryLayout from "../HistoryLayout/HistoryLayout";
import DepositHistory from "../pages/DepositHistory/DepositHistory";
import TurnoverHistory from "../pages/TurnoverHistory/TurnoverHistory";
import BetHistory from "../pages/BetHistory/BetHistory";
import AutoDepositHistory from "../pages/AutoDepositHistory/AutoDepositHistory";
import WithdrawHistory from "../pages/WithdrawHistory/WithdrawHistory";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import Wallet from "../pages/Wallet/Wallet";
import PersonalInfo from "../pages/PersonalInfo/PersonalInfo";
import Dispute from "../pages/Dispute/Dispute";
import PL from "../pages/PL/PL";
import Inbox from "../pages/Inbox/Inbox";
import Reward from "../pages/Rewards/Rewards";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <FirstVisitRoute>
            <Home />
          </FirstVisitRoute>
        ),
      },
      {
        path: "start",
        element: <Start />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "games/:categoryId",
        element: (
          <PrivateRoute>
            <Games />
          </PrivateRoute>
        ),
      },
      {
        path: "play-game/:gameId",
        element: (
          <PrivateRoute>
            <PlayGame />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit",
        element: (
          <PrivateRoute>
            <Deposit />
          </PrivateRoute>
        ),
      },
      {
        path: "auto-deposit",
        element: (
          <PrivateRoute>
            <AutoDeposit />
          </PrivateRoute>
        ),
      },
      {
        path: "withdraw",
        element: (
          <PrivateRoute>
            <Withdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "account",
        element: (
          <PrivateRoute>
            <Account />
          </PrivateRoute>
        ),
      },
      {
        path: "reset-password",

        element: (
          <PrivateRoute>
            {" "}
            <ResetPassword />
          </PrivateRoute>
        ),
      },
      {
        path: "wallet",
        element: (
          <PrivateRoute>
            {" "}
            <Wallet />
          </PrivateRoute>
        ),
      },
      {
        path: "personal-info",
        element: (
          <PrivateRoute>
            {" "}
            <PersonalInfo />
          </PrivateRoute>
        ),
      },
      {
        path: "dispute",
        element: (
          <PrivateRoute>
            {" "}
            <Dispute />
          </PrivateRoute>
        ),
      },
      {
        path: "pl",
        element: (
          <PrivateRoute>
            {" "}
            <PL />
          </PrivateRoute>
        ),
      },
       {
        path: "inbox",
        element: (
          <PrivateRoute>
            {" "}
            <Inbox />
          </PrivateRoute>
        ),
      },
      {
        path: "rewards",
        element: (
          <PrivateRoute>
            {" "}
            <Reward />
          </PrivateRoute>
        ),
      },
      {
        path: "invite-friends",
        element: (
          <PrivateRoute>
            <Share />
          </PrivateRoute>
        ),
      },
      {
        path: "history",
        element: (
          <PrivateRoute>
            <HistoryLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="deposit-history" replace />,
          },
          {
            path: "deposit-history",
            element: <DepositHistory />,
          },
          {
            path: "withdraw-history",
            element: <WithdrawHistory />,
          },
          {
            path: "auto-deposit-history",
            element: <AutoDepositHistory />,
          },
          {
            path: "bet-history",
            element: <BetHistory />,
          },
          {
            path: "turnover-history",
            element: <TurnoverHistory />,
          },
        ],
      },
    ],
  },
]);

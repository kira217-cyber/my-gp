import { createBrowserRouter } from "react-router";
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

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "/start",
        element: <Start />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/games",
        element: (
          <PrivateRoute>
            <Games />
          </PrivateRoute>
        ),
      },
      {
        path: "/deposit",
        element: (
          <PrivateRoute>
            <Deposit />
          </PrivateRoute>
        ),
      },
      {
        path: "/auto-deposit",
        element: (
          <PrivateRoute>
            <AutoDeposit />
          </PrivateRoute>
        ),
      },
      {
        path: "/withdraw",
        element: (
          <PrivateRoute>
            <Withdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "/account",
        element: (
          <PrivateRoute>
            <Account />
          </PrivateRoute>
        ),
      },
      {
        path: "/invite-friends",
        element: (
          <PrivateRoute>
            <Share />
          </PrivateRoute>
        ),
      },
      {
        path: "/",
        element: (
          <FirstVisitRoute>
            <Home />
          </FirstVisitRoute>
        ),
      },
    ],
  },
]);

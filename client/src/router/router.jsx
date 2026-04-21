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

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
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
        element: <Games />,
      },
      {
        path: "/deposit",
        element: <Deposit />,
      },
      {
        path: "/withdraw",
        element: <Withdraw />,
      },
      {
        path: "/account",
        element: <Account />,
      },
      {
        path: "/invite-friends",
        element: <Share />,
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

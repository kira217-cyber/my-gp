import React from "react";
import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import {
  selectAuth,
  selectIsAuthenticated,
} from "../features/auth/authSelectors";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (auth?.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-10 w-10 rounded-full border-4 border-[#2f79c9] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;

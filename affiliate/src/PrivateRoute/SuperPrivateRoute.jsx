import React from "react";
import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import {
  selectAuth,
  selectIsAuthenticated,
  selectUser,
} from "../features/auth/authSelectors";

const SuperPrivateRoute = ({ children }) => {
  const location = useLocation();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (auth?.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2f79c9] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== "super-aff-user") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default SuperPrivateRoute;
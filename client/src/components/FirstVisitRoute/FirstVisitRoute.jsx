import React from "react";
import { Navigate } from "react-router";
import { useSelector } from "react-redux";
import { selectAuth, selectIsAuthenticated } from "../../features/auth/authSelectors";


const FirstVisitRoute = ({ children }) => {
  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (auth?.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#efefef]">
        <div className="h-10 w-10 rounded-full border-4 border-[#1f5f98] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/start" replace />;
  }

  return children;
};

export default FirstVisitRoute;

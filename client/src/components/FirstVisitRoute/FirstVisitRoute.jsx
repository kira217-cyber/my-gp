import React from "react";
import { Navigate } from "react-router";

const FirstVisitRoute = ({ children }) => {
  const hasVisitedStart = localStorage.getItem("hasVisitedStart");

  if (!hasVisitedStart) {
    return <Navigate to="/start" replace />;
  }

  return children;
};

export default FirstVisitRoute;
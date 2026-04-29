export const AFF_ROLES = ["aff-user", "super-aff-user"];

export const selectAuth = (state) => state.auth;

export const selectUser = (state) => state.auth.user;

export const selectToken = (state) => state.auth.token;

export const selectUserRole = (state) => state.auth.user?.role || "";

export const selectIsAffUser = (state) => state.auth.user?.role === "aff-user";

export const selectIsSuperAffUser = (state) =>
  state.auth.user?.role === "super-aff-user";

export const selectIsAuthenticated = (state) => {
  const { user, token } = state.auth;

  return !!token && !!user?.phone && AFF_ROLES.includes(user?.role);
};

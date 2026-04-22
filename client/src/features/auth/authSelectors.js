export const selectAuth = (state) => state.auth;

export const selectUser = (state) => state.auth.user;

export const selectToken = (state) => state.auth.token;

export const selectIsAuthenticated = (state) => {
  const { user, token } = state.auth;
  return !!token && !!user?.phone;
};

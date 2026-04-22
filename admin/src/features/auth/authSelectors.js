export const selectAuth = (state) => state.auth;

export const selectIsAuthenticated = (state) => {
  const { admin, token } = state.auth;
  return !!token && !!admin?.email;
};

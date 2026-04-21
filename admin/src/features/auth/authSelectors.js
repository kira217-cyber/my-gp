export const selectAuth = (state) => state.auth;

export const selectIsAuthenticated = (state) => {
  const { user } = state.auth;

  return (
    !!user &&
    !!user.email &&
    !!user.password &&
    !!user.name &&
    !!user.phone
  );
};

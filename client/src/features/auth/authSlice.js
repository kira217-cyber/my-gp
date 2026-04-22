import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    rehydrateAuth: (state) => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          state.user = JSON.parse(storedUser);
          state.token = storedToken;
        } else {
          state.user = null;
          state.token = null;
        }
      } catch (error) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        state.user = null;
        state.token = null;
      } finally {
        state.loading = false;
      }
    },

    setCredentials: (state, action) => {
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;
      state.loading = false;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { rehydrateAuth, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

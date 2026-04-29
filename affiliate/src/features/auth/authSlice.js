import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: localStorage.getItem("aff_token") || null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    rehydrateAuth: (state) => {
      try {
        const storedUser = localStorage.getItem("aff_user");
        const storedToken = localStorage.getItem("aff_token");

        if (storedUser && storedToken) {
          state.user = JSON.parse(storedUser);
          state.token = storedToken;
        } else {
          state.user = null;
          state.token = null;
        }
      } catch (error) {
        localStorage.removeItem("aff_user");
        localStorage.removeItem("aff_token");
        state.user = null;
        state.token = null;
      } finally {
        state.loading = false;
      }
    },

    setCredentials: (state, action) => {
      const { user, token } = action.payload || {};

      state.user = user || null;
      state.token = token || null;
      state.loading = false;

      if (user && token) {
        localStorage.setItem("aff_user", JSON.stringify(user));
        localStorage.setItem("aff_token", token);
      } else {
        localStorage.removeItem("aff_user");
        localStorage.removeItem("aff_token");
      }
    },

    updateAuthUser: (state, action) => {
      state.user = {
        ...(state.user || {}),
        ...(action.payload || {}),
      };

      if (state.user) {
        localStorage.setItem("aff_user", JSON.stringify(state.user));
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;

      localStorage.removeItem("aff_user");
      localStorage.removeItem("aff_token");
    },
  },
});

export const { rehydrateAuth, setCredentials, updateAuthUser, logout } =
  authSlice.actions;

export default authSlice.reducer;

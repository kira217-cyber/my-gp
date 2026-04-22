import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  admin: null,
  token: localStorage.getItem("token") || null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    rehydrateAuth: (state) => {
      try {
        const storedAdmin = localStorage.getItem("admin");
        const storedToken = localStorage.getItem("token");

        if (storedAdmin && storedToken) {
          state.admin = JSON.parse(storedAdmin);
          state.token = storedToken;
        } else {
          state.admin = null;
          state.token = null;
        }
      } catch (error) {
        localStorage.removeItem("admin");
        localStorage.removeItem("token");
        state.admin = null;
        state.token = null;
      } finally {
        state.loading = false;
      }
    },

    setCredentials: (state, action) => {
      const { admin, token } = action.payload;

      state.admin = admin;
      state.token = token;
      state.loading = false;

      localStorage.setItem("admin", JSON.stringify(admin));
      localStorage.setItem("token", token);
    },

    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.loading = false;

      localStorage.removeItem("admin");
      localStorage.removeItem("token");
    },
  },
});

export const { rehydrateAuth, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

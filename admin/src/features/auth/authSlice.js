import { createSlice } from "@reduxjs/toolkit";

/**
 * 👇 Demo user (same as Context)
 */
const DEMO_USER = {
  name: "Demo User",
  email: "demo@example.com",
  password: "demo123",
  phone: "01700000000",
};

const initialState = {
  user: null,
  token: "demo-token",
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * 🔁 Context useEffect equivalent
     */
    rehydrateAuth: (state) => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          state.user = JSON.parse(storedUser);
          state.token = storedToken;
        }
      } catch (err) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        state.loading = false;
      }
    },

    /**
     * ✅ Demo Login
     */
    demoLogin: (state) => {
      state.user = DEMO_USER;
      state.token = "demo-token";

      localStorage.setItem("user", JSON.stringify(DEMO_USER));
      localStorage.setItem("token", "demo-token");
    },

    /**
     * ❌ Logout
     */
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { rehydrateAuth, demoLogin, logout } = authSlice.actions;
export default authSlice.reducer;

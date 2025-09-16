import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  id: null,
  username: null,
  roles: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.roles = action.payload.roles;
    },
    clearAuth: (state) => {
      state.token = null;
      state.id = null;
      state.username = null;
      state.roles = [];
      localStorage.removeItem("authState"); // Clear localStorage on logout
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;

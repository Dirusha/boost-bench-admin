import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  id: null,
  username: null,
  permissions: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.permissions = action.payload.permissions;
    },
    clearAuth: (state) => {
      state.token = null;
      state.id = null;
      state.username = null;
      state.permissions = [];
      localStorage.removeItem("authState"); // Clear localStorage on logout
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import roleReducer from "./features/user/roleSlice";
import userReducer from "./features/user/userSlice";

const persistedState = localStorage.getItem("authState")
  ? JSON.parse(localStorage.getItem("authState"))
  : {
      token: null,
      id: null,
      username: null,
      roles: [],
    };

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roles: roleReducer,
    user: userReducer,
  },
  preloadedState: {
    auth: persistedState,
  },
});

store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem("authState", JSON.stringify(state.auth));
});

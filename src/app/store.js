import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import roleReducer from "./features/user/roleSlice";
import userReducer from "./features/user/userSlice";
import productReducer from "./features/products/productSlice";
import categoryReducer from "./features/categories/categorySlice";
import tagReducer from "./features/tags/tagSlice";

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
    products: productReducer,
    categories: categoryReducer,
    tags: tagReducer,
  },
  preloadedState: {
    auth: persistedState,
  },
});

store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem("authState", JSON.stringify(state.auth));
});

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../../services/apiService";

// ===============================
// ORDER MANAGEMENT THUNKS
// ===============================

// Place a new order
export const placeOrder = createAsyncThunk(
  "orders/placeOrder",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.post(
        `/api/orders/place/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get all orders for a user
export const getUserOrders = createAsyncThunk(
  "orders/getUserOrders",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.get(`/api/orders/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get a specific order by ID for a user
export const getOrderById = createAsyncThunk(
  "orders/getOrderById",
  async ({ orderId, userId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.get(
        `/api/orders/${orderId}/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get all orders (admin)
export const getAllOrders = createAsyncThunk(
  "orders/getAllOrders",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.get("/api/orders/all", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update order status (admin)
export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ orderId, status }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.put(
        `/api/orders/${orderId}/status?status=${encodeURIComponent(status)}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; // Assuming apiService returns response.data; adjust if it returns the full response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ===============================
// SLICE DEFINITION
// ===============================

const initialState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  // Loading states for specific operations
  loadingStates: {
    placeOrder: false,
    userOrders: false,
    orderDetail: false,
    allOrders: false,
    updateStatus: false,
  },
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // Order selection
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
    },

    // Reset loading states
    resetLoadingStates: (state) => {
      Object.keys(state.loadingStates).forEach((key) => {
        state.loadingStates[key] = false;
      });
    },

    // Reset state
    resetOrderState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===============================
      // ORDER CASES
      // ===============================

      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.loadingStates.placeOrder = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loadingStates.placeOrder = false;
        if (action.payload) {
          state.orders.push(action.payload);
        }
        state.selectedOrder = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loadingStates.placeOrder = false;
        state.error = action.payload;
      })

      // Get User Orders
      .addCase(getUserOrders.pending, (state) => {
        state.loadingStates.userOrders = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loadingStates.userOrders = false;
        state.orders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loadingStates.userOrders = false;
        state.error = action.payload;
        state.orders = [];
      })

      // Get Order By ID
      .addCase(getOrderById.pending, (state) => {
        state.loadingStates.orderDetail = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loadingStates.orderDetail = false;
        state.selectedOrder = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loadingStates.orderDetail = false;
        state.error = action.payload;
      })

      // Get All Orders
      .addCase(getAllOrders.pending, (state) => {
        state.loadingStates.allOrders = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loadingStates.allOrders = false;
        state.orders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loadingStates.allOrders = false;
        state.error = action.payload;
        state.orders = [];
      })

      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loadingStates.updateStatus = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loadingStates.updateStatus = false;
        if (action.payload) {
          const index = state.orders.findIndex(
            (order) => order.id === action.payload.id
          );
          if (index !== -1) {
            state.orders[index] = action.payload;
          }
          state.selectedOrder = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loadingStates.updateStatus = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedOrder,
  clearSelectedOrder,
  clearError,
  resetLoadingStates,
  resetOrderState,
} = orderSlice.actions;

export default orderSlice.reducer;

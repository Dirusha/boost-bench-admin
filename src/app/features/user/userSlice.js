// Updated userSlice.js (No major changes needed, but ensuring consistency with store key 'user')
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../../services/apiService";

// ===============================
// USER MANAGEMENT THUNKS
// ===============================

// Get all users
export const getUsers = createAsyncThunk(
  "users/getUsers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.get("/api/users", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get user by ID
export const getUserById = createAsyncThunk(
  "users/getUserById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.get(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create user
export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      // Transform userData to match API expected format
      const transformedData = {
        username: userData.username,
        password: userData.password,
        fullName: userData.fullName,
        workEmail: userData.workEmail,
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        city: userData.city,
        country: userData.country,
        zipCode: userData.zipCode,
        roleIds: userData.roles || userData.roleIds || [],
      };

      const response = await apiService.post("/api/users", transformedData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, userData }, { getState, rejectWithValue }) => {
    try {
        const { auth } = getState();
      // Transform userData to match API expected format
      const transformedData = {
        username: userData.username,
        password: userData.password,
        fullName: userData.fullName,
        workEmail: userData.workEmail,
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        city: userData.city,
        country: userData.country,
        zipCode: userData.zipCode,
        roleIds: userData.roles || userData.roleIds || [],
      };

      const response = await apiService.put(
        `/api/users/${id}`,
        transformedData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
        );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.delete(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      // API returns { "message": "User deleted successfully" }
      // We return the id to remove it from state
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add role to user
export const addRoleToUser = createAsyncThunk(
  "users/addRoleToUser",
  async ({ userId, roleId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.post(
        `/api/users/${userId}/roles/${roleId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Remove role from user
export const removeRoleFromUser = createAsyncThunk(
  "users/removeRoleFromUser",
  async ({ userId, roleId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.delete(
        `/api/users/${userId}/roles/${roleId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Toggle user status (enable/disable)
export const toggleUserStatus = createAsyncThunk(
  "users/toggleUserStatus",
  async ({ userId, enabled }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.patch(
        `/api/users/${userId}/status`,
        { enabled },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ===============================
// SLICE DEFINITION
// ===============================

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  // Loading states for specific operations
  loadingStates: {
    users: false,
    userCreate: false,
    userUpdate: false,
    userDelete: false,
    userStatusToggle: false,
    roleManagement: false,
    addRoleToUser: false,
    removeRoleFromUser: false,
  },
};

const userSlice = createSlice({
  name: "user", // Fixed: Changed name to 'user' for consistency (though not strictly necessary)
  initialState,
  reducers: {
    // User selection
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
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
    resetUserState: (state) => {
      return initialState;
    },

    // Update user in list (for optimistic updates)
    updateUserInList: (state, action) => {
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ===============================
      // USER MANAGEMENT CASES
      // ===============================

      // Get Users
      .addCase(getUsers.pending, (state) => {
        state.loadingStates.users = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loadingStates.users = false;
        state.users = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loadingStates.users = false;
        state.error = action.payload;
        state.users = []; // Reset on error
      })

      // Get User By ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create User
      .addCase(createUser.pending, (state) => {
        state.loadingStates.userCreate = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loadingStates.userCreate = false;
        if (action.payload) {
          state.users.push(action.payload);
        }
        state.selectedUser = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loadingStates.userCreate = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loadingStates.userUpdate = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loadingStates.userUpdate = false;
        if (action.payload) {
          const index = state.users.findIndex(
            (user) => user.id === action.payload.id
          );
          if (index !== -1) {
            state.users[index] = action.payload;
          }
        }
        state.selectedUser = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loadingStates.userUpdate = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loadingStates.userDelete = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loadingStates.userDelete = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loadingStates.userDelete = false;
        state.error = action.payload;
      })

      // Add Role to User
      .addCase(addRoleToUser.pending, (state) => {
        state.loadingStates.addRoleToUser = true;
        state.error = null;
      })
      .addCase(addRoleToUser.fulfilled, (state, action) => {
        state.loadingStates.addRoleToUser = false;
        if (action.payload) {
          const index = state.users.findIndex(
            (user) => user.id === action.payload.id
          );
          if (index !== -1) {
            state.users[index] = action.payload;
          }
          if (state.selectedUser?.id === action.payload.id) {
            state.selectedUser = action.payload;
          }
        }
      })
      .addCase(addRoleToUser.rejected, (state, action) => {
        state.loadingStates.addRoleToUser = false;
        state.error = action.payload;
      })

      // Remove Role from User
      .addCase(removeRoleFromUser.pending, (state) => {
        state.loadingStates.removeRoleFromUser = true;
        state.error = null;
      })
      .addCase(removeRoleFromUser.fulfilled, (state, action) => {
        state.loadingStates.removeRoleFromUser = false;
        if (action.payload) {
          const index = state.users.findIndex(
            (user) => user.id === action.payload.id
          );
          if (index !== -1) {
            state.users[index] = action.payload;
          }
          if (state.selectedUser?.id === action.payload.id) {
            state.selectedUser = action.payload;
          }
        }
      })
      .addCase(removeRoleFromUser.rejected, (state, action) => {
        state.loadingStates.removeRoleFromUser = false;
        state.error = action.payload;
      })

      // Toggle User Status
      .addCase(toggleUserStatus.pending, (state) => {
        state.loadingStates.userStatusToggle = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loadingStates.userStatusToggle = false;
        if (action.payload) {
          const index = state.users.findIndex(
            (user) => user.id === action.payload.id
          );
          if (index !== -1) {
            state.users[index] = action.payload;
          }
          if (state.selectedUser?.id === action.payload.id) {
            state.selectedUser = action.payload;
          }
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loadingStates.userStatusToggle = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedUser,
  clearSelectedUser,
  clearError,
  resetLoadingStates,
  resetUserState,
  updateUserInList,
} = userSlice.actions;

export default userSlice.reducer;

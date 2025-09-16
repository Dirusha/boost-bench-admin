// src/features/roles/roleSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../../services/apiService";

// ===============================
// PERMISSION MANAGEMENT THUNKS
// ===============================

// Get all permissions
export const getPermissions = createAsyncThunk(
  "roles/getPermissions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.get("/api/permissions", {
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

// Get permission by ID
export const getPermissionById = createAsyncThunk(
  "roles/getPermissionById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.get(`/api/permissions/${id}`, {
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

// Create permission
export const createPermission = createAsyncThunk(
  "roles/createPermission",
  async (permissionData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.post(
        "/api/permissions",
        permissionData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json", // Ensure correct Content-Type
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update permission
export const updatePermission = createAsyncThunk(
  "roles/updatePermission",
  async ({ id, permissionData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.put(
        `/api/permissions/${id}`,
        permissionData,
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

// Delete permission
export const deletePermission = createAsyncThunk(
  "roles/deletePermission",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await apiService.delete(`/api/permissions/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ===============================
// ROLE MANAGEMENT THUNKS
// ===============================

// Get all roles
export const getRoles = createAsyncThunk(
  "roles/getRoles",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.get("/api/roles", {
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

// Get role by ID
export const getRoleById = createAsyncThunk(
  "roles/getRoleById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.get(`/api/roles/${id}`, {
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

// Create role
export const createRole = createAsyncThunk(
  "roles/createRole",
  async (roleData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      // Transform roleData to match API expected format
      const transformedData = {
        name: roleData.name,
        permissionIds: roleData.permissions || roleData.permissionIds || [],
      };
      const response = await apiService.post("/api/roles", transformedData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json", // Ensure correct Content-Type
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update role
export const updateRole = createAsyncThunk(
  "roles/updateRole",
  async ({ id, roleData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      // Transform roleData to match API expected format
      const transformedData = {
        name: roleData.name,
        permissionIds: roleData.permissions || roleData.permissionIds || [],
      };
      const response = await apiService.put(
        `/api/roles/${id}`,
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

// Delete role
export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await apiService.delete(`/api/roles/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add single permission to role
export const addPermissionToRole = createAsyncThunk(
  "roles/addPermissionToRole",
  async ({ roleId, permissionId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.post(
        `/api/roles/${roleId}/permissions/${permissionId}`,
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

// Remove single permission from role
export const removePermissionFromRole = createAsyncThunk(
  "roles/removePermissionFromRole",
  async ({ roleId, permissionId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.delete(
        `/api/roles/${roleId}/permissions/${permissionId}`,
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

// ===============================
// SLICE DEFINITION
// ===============================

const initialState = {
  roles: [],
  permissions: [],
  selectedRole: null,
  selectedPermission: null,
  loading: false,
  error: null,
  // Loading states for specific operations
  loadingStates: {
    roles: false,
    permissions: false,
    roleCreate: false,
    roleUpdate: false,
    roleDelete: false,
    permissionCreate: false,
    permissionUpdate: false,
    permissionDelete: false,
    permissionManagement: false,
    addPermissionToRole: false,
    removePermissionFromRole: false,
  },
};

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    // Role selection
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },

    // Permission selection
    setSelectedPermission: (state, action) => {
      state.selectedPermission = action.payload;
    },
    clearSelectedPermission: (state) => {
      state.selectedPermission = null;
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
    resetRoleState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===============================
      // PERMISSION CASES
      // ===============================

      // Get Permissions
      .addCase(getPermissions.pending, (state) => {
        state.loadingStates.permissions = true;
        state.error = null;
      })
      .addCase(getPermissions.fulfilled, (state, action) => {
        state.loadingStates.permissions = false;
        state.permissions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getPermissions.rejected, (state, action) => {
        state.loadingStates.permissions = false;
        state.error = action.payload;
        state.permissions = []; // Reset on error
      })

      // Get Permission By ID
      .addCase(getPermissionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPermissionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPermission = action.payload;
      })
      .addCase(getPermissionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Permission
      .addCase(createPermission.pending, (state) => {
        state.loadingStates.permissionCreate = true;
        state.error = null;
      })
      .addCase(createPermission.fulfilled, (state, action) => {
        state.loadingStates.permissionCreate = false;
        if (action.payload) {
          state.permissions.push(action.payload);
        }
        state.selectedPermission = null;
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.loadingStates.permissionCreate = false;
        state.error = action.payload;
      })

      // Update Permission
      .addCase(updatePermission.pending, (state) => {
        state.loadingStates.permissionUpdate = true;
        state.error = null;
      })
      .addCase(updatePermission.fulfilled, (state, action) => {
        state.loadingStates.permissionUpdate = false;
        if (action.payload) {
          const index = state.permissions.findIndex(
            (perm) => perm.id === action.payload.id
          );
          if (index !== -1) {
            state.permissions[index] = action.payload;
          }
        }
        state.selectedPermission = null;
      })
      .addCase(updatePermission.rejected, (state, action) => {
        state.loadingStates.permissionUpdate = false;
        state.error = action.payload;
      })

      // Delete Permission
      .addCase(deletePermission.pending, (state) => {
        state.loadingStates.permissionDelete = true;
        state.error = null;
      })
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.loadingStates.permissionDelete = false;
        state.permissions = state.permissions.filter(
          (perm) => perm.id !== action.payload
        );
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.loadingStates.permissionDelete = false;
        state.error = action.payload;
      })

      // ===============================
      // ROLE CASES
      // ===============================

      // Get Roles
      .addCase(getRoles.pending, (state) => {
        state.loadingStates.roles = true;
        state.error = null;
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.loadingStates.roles = false;
        state.roles = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.loadingStates.roles = false;
        state.error = action.payload;
        state.roles = []; // Reset on error
      })

      // Get Role By ID
      .addCase(getRoleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRole = action.payload;
      })
      .addCase(getRoleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Role
      .addCase(createRole.pending, (state) => {
        state.loadingStates.roleCreate = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loadingStates.roleCreate = false;
        if (action.payload) {
          state.roles.push(action.payload);
        }
        state.selectedRole = null;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loadingStates.roleCreate = false;
        state.error = action.payload;
      })

      // Update Role
      .addCase(updateRole.pending, (state) => {
        state.loadingStates.roleUpdate = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loadingStates.roleUpdate = false;
        if (action.payload) {
          const index = state.roles.findIndex(
            (role) => role.id === action.payload.id
          );
          if (index !== -1) {
            state.roles[index] = action.payload;
          }
        }
        state.selectedRole = null;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loadingStates.roleUpdate = false;
        state.error = action.payload;
      })

      // Delete Role
      .addCase(deleteRole.pending, (state) => {
        state.loadingStates.roleDelete = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loadingStates.roleDelete = false;
        state.roles = state.roles.filter((role) => role.id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loadingStates.roleDelete = false;
        state.error = action.payload;
      })

      // Add Permission to Role
      .addCase(addPermissionToRole.pending, (state) => {
        state.loadingStates.addPermissionToRole = true;
        state.error = null;
      })
      .addCase(addPermissionToRole.fulfilled, (state, action) => {
        state.loadingStates.addPermissionToRole = false;
        if (action.payload) {
          const index = state.roles.findIndex(
            (role) => role.id === action.payload.id
          );
          if (index !== -1) {
            state.roles[index] = action.payload;
          }
          if (state.selectedRole?.id === action.payload.id) {
            state.selectedRole = action.payload;
          }
        }
      })
      .addCase(addPermissionToRole.rejected, (state, action) => {
        state.loadingStates.addPermissionToRole = false;
        state.error = action.payload;
      })

      // Remove Permission from Role
      .addCase(removePermissionFromRole.pending, (state) => {
        state.loadingStates.removePermissionFromRole = true;
        state.error = null;
      })
      .addCase(removePermissionFromRole.fulfilled, (state, action) => {
        state.loadingStates.removePermissionFromRole = false;
        if (action.payload) {
          const index = state.roles.findIndex(
            (role) => role.id === action.payload.id
          );
          if (index !== -1) {
            state.roles[index] = action.payload;
          }
          if (state.selectedRole?.id === action.payload.id) {
            state.selectedRole = action.payload;
          }
        }
      })
      .addCase(removePermissionFromRole.rejected, (state, action) => {
        state.loadingStates.removePermissionFromRole = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedRole,
  clearSelectedRole,
  setSelectedPermission,
  clearSelectedPermission,
  clearError,
  resetLoadingStates,
  resetRoleState,
} = roleSlice.actions;

export default roleSlice.reducer;

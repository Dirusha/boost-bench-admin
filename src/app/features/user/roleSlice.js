// src/features/roles/roleSlice.js (updated with permission management thunks)
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../../services/apiService";

// Existing Role Thunks (unchanged)
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
      return rejectWithValue(error.message);
    }
  }
);

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
      return rejectWithValue(error.message);
    }
  }
);

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
      return rejectWithValue(error.message);
    }
  }
);

export const createRole = createAsyncThunk(
  "roles/createRole",
  async (roleData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.post("/api/roles", roleData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateRole = createAsyncThunk(
  "roles/updateRole",
  async ({ id, roleData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.put(`/api/roles/${id}`, roleData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

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
      return rejectWithValue(error.message);
    }
  }
);

// New Permission Thunks
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
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

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
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

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
      return rejectWithValue(error.message);
    }
  }
);

// Slice (updated with permission cases)
const initialState = {
  roles: [],
  permissions: [],
  selectedRole: null,
  selectedPermission: null,
  loading: false,
  error: null,
};

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
    setSelectedPermission: (state, action) => {
      state.selectedPermission = action.payload;
    },
    clearSelectedPermission: (state) => {
      state.selectedPermission = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Permissions
      .addCase(getPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(getPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Create Permission
      .addCase(createPermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPermission.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions.push(action.payload);
        state.selectedPermission = null;
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Update Permission
      .addCase(updatePermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePermission.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.permissions.findIndex(
          (perm) => perm.id === action.payload.id
        );
        if (index !== -1) {
          state.permissions[index] = action.payload;
        }
        state.selectedPermission = null;
      })
      .addCase(updatePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Delete Permission
      .addCase(deletePermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = state.permissions.filter(
          (perm) => perm.id !== action.payload
        );
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Roles cases (unchanged)
      .addCase(getRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
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
        state.error = action.payload || action.error.message;
      })
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.push(action.payload);
        state.selectedRole = null;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.roles.findIndex(
          (role) => role.id === action.payload.id
        );
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
        state.selectedRole = null;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = state.roles.filter((role) => role.id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const {
  setSelectedRole,
  clearSelectedRole,
  setSelectedPermission,
  clearSelectedPermission,
} = roleSlice.actions;
export default roleSlice.reducer;

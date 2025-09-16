// src/features/tags/tagSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../../services/apiService";

// ===============================
// TAG MANAGEMENT THUNKS
// ===============================

// Get all tags
export const getTags = createAsyncThunk(
  "tags/getTags",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.get("/api/tags", {
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

// Get tag by ID
export const getTagById = createAsyncThunk(
  "tags/getTagById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.get(`/api/tags/${id}`, {
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

// Create tag
export const createTag = createAsyncThunk(
  "tags/createTag",
  async (tagData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.post("/api/tags", tagData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update tag
export const updateTag = createAsyncThunk(
  "tags/updateTag",
  async ({ id, tagData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.put(`/api/tags/${id}`, tagData, {
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

// Delete tag
export const deleteTag = createAsyncThunk(
  "tags/deleteTag",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await apiService.delete(`/api/tags/${id}`, {
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
// SLICE DEFINITION
// ===============================

const initialState = {
  tags: [],
  selectedTag: null,
  loading: false,
  error: null,
  // Loading states for specific operations
  loadingStates: {
    tags: false,
    tagCreate: false,
    tagUpdate: false,
    tagDelete: false,
    tagDetail: false,
  },
};

const tagSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {
    // Tag selection
    setSelectedTag: (state, action) => {
      state.selectedTag = action.payload;
    },
    clearSelectedTag: (state) => {
      state.selectedTag = null;
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
    resetTagState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===============================
      // TAG CASES
      // ===============================

      // Get Tags
      .addCase(getTags.pending, (state) => {
        state.loadingStates.tags = true;
        state.error = null;
      })
      .addCase(getTags.fulfilled, (state, action) => {
        state.loadingStates.tags = false;
        state.tags = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getTags.rejected, (state, action) => {
        state.loadingStates.tags = false;
        state.error = action.payload;
        state.tags = []; // Reset on error
      })

      // Get Tag By ID
      .addCase(getTagById.pending, (state) => {
        state.loadingStates.tagDetail = true;
        state.error = null;
      })
      .addCase(getTagById.fulfilled, (state, action) => {
        state.loadingStates.tagDetail = false;
        state.selectedTag = action.payload;
      })
      .addCase(getTagById.rejected, (state, action) => {
        state.loadingStates.tagDetail = false;
        state.error = action.payload;
      })

      // Create Tag
      .addCase(createTag.pending, (state) => {
        state.loadingStates.tagCreate = true;
        state.error = null;
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.loadingStates.tagCreate = false;
        if (action.payload) {
          state.tags.push(action.payload);
        }
        state.selectedTag = null;
      })
      .addCase(createTag.rejected, (state, action) => {
        state.loadingStates.tagCreate = false;
        state.error = action.payload;
      })

      // Update Tag
      .addCase(updateTag.pending, (state) => {
        state.loadingStates.tagUpdate = true;
        state.error = null;
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        state.loadingStates.tagUpdate = false;
        if (action.payload) {
          const index = state.tags.findIndex(
            (tag) => tag.id === action.payload.id
          );
          if (index !== -1) {
            state.tags[index] = action.payload;
          }
        }
        state.selectedTag = null;
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.loadingStates.tagUpdate = false;
        state.error = action.payload;
      })

      // Delete Tag
      .addCase(deleteTag.pending, (state) => {
        state.loadingStates.tagDelete = true;
        state.error = null;
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.loadingStates.tagDelete = false;
        state.tags = state.tags.filter((tag) => tag.id !== action.payload);
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.loadingStates.tagDelete = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedTag,
  clearSelectedTag,
  clearError,
  resetLoadingStates,
  resetTagState,
} = tagSlice.actions;

export default tagSlice.reducer;

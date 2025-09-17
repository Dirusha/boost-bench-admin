// src/features/categories/categorySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../../services/apiService";

// ===============================
// CATEGORY MANAGEMENT THUNKS
// ===============================

// Get all categories
export const getCategories = createAsyncThunk(
  "categories/getCategories",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.get("/api/categories", {
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

// Get category by ID
export const getCategoryById = createAsyncThunk(
  "categories/getCategoryById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.get(`/api/categories/${id}`, {
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

// Create category
export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.post("/api/categories", categoryData, {
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

// Update category
export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, categoryData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.put(
        `/api/categories/${id}`,
        categoryData,
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

// Delete category
export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await apiService.delete(`/api/categories/${id}`, {
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
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
  // Loading states for specific operations
  loadingStates: {
    categories: false,
    categoryCreate: false,
    categoryUpdate: false,
    categoryDelete: false,
    categoryDetail: false,
  },
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    // Category selection
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
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
    resetCategoryState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===============================
      // CATEGORY CASES
      // ===============================

      // Get Categories
      .addCase(getCategories.pending, (state) => {
        state.loadingStates.categories = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loadingStates.categories = false;
        state.categories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loadingStates.categories = false;
        state.error = action.payload;
        state.categories = []; // Reset on error
      })

      // Get Category By ID
      .addCase(getCategoryById.pending, (state) => {
        state.loadingStates.categoryDetail = true;
        state.error = null;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.loadingStates.categoryDetail = false;
        state.selectedCategory = action.payload;
      })
      .addCase(getCategoryById.rejected, (state, action) => {
        state.loadingStates.categoryDetail = false;
        state.error = action.payload;
      })

      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.loadingStates.categoryCreate = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loadingStates.categoryCreate = false;
        if (action.payload) {
          state.categories.push(action.payload);
        }
        state.selectedCategory = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loadingStates.categoryCreate = false;
        state.error = action.payload;
      })

      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.loadingStates.categoryUpdate = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loadingStates.categoryUpdate = false;
        if (action.payload) {
          const index = state.categories.findIndex(
            (category) => category.id === action.payload.id
          );
          if (index !== -1) {
            state.categories[index] = action.payload;
          }
        }
        state.selectedCategory = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loadingStates.categoryUpdate = false;
        state.error = action.payload;
      })

      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.loadingStates.categoryDelete = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loadingStates.categoryDelete = false;
        state.categories = state.categories.filter(
          (category) => category.id !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loadingStates.categoryDelete = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedCategory,
  clearSelectedCategory,
  clearError,
  resetLoadingStates,
  resetCategoryState,
} = categorySlice.actions;

export default categorySlice.reducer;

// src/features/products/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../../services/apiService";

// ===============================
// PRODUCT MANAGEMENT THUNKS
// ===============================

// Get all products with filters
export const getProducts = createAsyncThunk(
  "products/getProducts",
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
      if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
      if (filters.period) queryParams.append("period", filters.period);
      if (filters.specialOffers)
        queryParams.append("specialOffers", filters.specialOffers);
      if (filters.bestsellers)
        queryParams.append("bestsellers", filters.bestsellers);
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        queryParams.append("categoryIds", filters.categoryIds.join(","));
      }
      if (filters.tagIds && filters.tagIds.length > 0) {
        queryParams.append("tagIds", filters.tagIds.join(","));
      }

      const queryString = queryParams.toString();
      const url = queryString
        ? `/api/products?${queryString}`
        : "/api/products";

      const response = await apiService.get(url, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      console.log("Fetched products:", response);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get product by ID
export const getProductById = createAsyncThunk(
  "products/getProductById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.get(`/api/products/${id}`, {
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

// Simple test function - call this directly from your component for debugging
export const testDirectAPI = async (token) => {
  try {
    console.log("Testing direct API call...");

    const formData = new FormData();
    formData.append(
      "product",
      JSON.stringify({
        name: "Test Product",
        description: "Test Description",
        price: 100,
        quantity: 10,
        availableQuantity: 10,
        discount: 0,
        color: "red",
        sku: "TEST001",
        categoryIds: [1],
        tagIds: [1],
      })
    );

    const response = await fetch("http://localhost:9000/api/products", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log("Direct test response status:", response.status);
    console.log("Direct test response headers:", [
      ...response.headers.entries(),
    ]);

    const responseText = await response.text();
    console.log("Direct test raw response:", responseText);

    if (response.ok) {
      console.log("Direct test SUCCESS!");
      return JSON.parse(responseText);
    } else {
      console.error("Direct test FAILED:", responseText);
      return { error: responseText, status: response.status };
    }
  } catch (error) {
    console.error("Direct test ERROR:", error);
    return { error: error.message };
  }
};

// Debug function to test exact Postman structure
export const debugCreateProduct = createAsyncThunk(
  "products/debugCreateProduct",
  async ({ productData, images }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      // Replicate EXACT Postman structure
      const formData = new FormData();

      // Use the exact JSON format from Postman
      const productJson = `{
  "name": "${productData.name || "New Backpack 2"}",
  "description": "${
    productData.description || "A stylish and durable backpack."
  }",
  "price": ${parseFloat(productData.price) || 159.0},
  "quantity": ${parseInt(productData.quantity) || 100},
  "availableQuantity": ${parseInt(productData.availableQuantity) || 95},
  "discount": ${parseFloat(productData.discount) || 10.0},
  "color": "${productData.color || "Gray"}",
  "sku": "${productData.sku || "BP001"}",
  "categoryIds": [${(productData.categoryIds || [1, 2]).join(", ")}],
  "tagIds": [${(productData.tagIds || [1]).join(", ")}]
}`;

      formData.append("product", productJson);

      // Add images
      if (images && images.length > 0) {
        images.forEach((image) => {
          if (image instanceof File) {
            formData.append("images", image);
          }
        });
      }

      console.log("Debug - Exact JSON being sent:");
      console.log(productJson);

      console.log("Debug - FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Try with fetch instead of apiService to rule out apiService issues
      const response = await fetch("http://localhost:9000/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Raw error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Debug create product error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Create product with mixed JSON and FormData approach (using raw fetch for debugging)
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async ({ productData, images }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      // Create FormData exactly like Postman generates
      const formData = new FormData();

      // Create the product JSON string with proper formatting
      const productJson = JSON.stringify(
        {
          name: productData.name || "",
          description: productData.description || "",
          price: parseFloat(productData.price) || 0,
          quantity: parseInt(productData.quantity) || 0,
          availableQuantity: parseInt(productData.availableQuantity) || 0,
          discount: parseFloat(productData.discount) || 0,
          color: productData.color || "",
          sku: productData.sku || "",
          categoryIds: productData.categoryIds || [],
          tagIds: productData.tagIds || [],
        },
        null,
        2
      ); // Pretty format like Postman

      // Add the product data as JSON string
      formData.append("product", productJson);

      // Add images if provided
      if (images && images.length > 0) {
        images.forEach((image) => {
          if (image instanceof File) {
            formData.append("images", image);
          }
        });
      }

      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      console.log("Product JSON being sent:", productJson);

      // Use raw fetch instead of apiService for better error handling
      const response = await fetch("http://localhost:9000/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Raw error response:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }

        return rejectWithValue({
          status: response.status,
          statusText: response.statusText,
          message: errorData.message || errorText,
          data: errorData,
        });
      }

      const data = await response.json();
      console.log("Success response:", data);
      return data;
    } catch (error) {
      console.error("Create product error:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      return rejectWithValue({
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
  }
);

// Alternative: Create product with pure FormData (individual fields)
export const createProductWithFormData = createAsyncThunk(
  "products/createProductWithFormData",
  async ({ productData, images }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const formData = new FormData();

      // Add individual product fields
      formData.append("name", productData.name || "");
      formData.append("description", productData.description || "");
      formData.append("price", productData.price?.toString() || "0");
      formData.append("quantity", productData.quantity?.toString() || "0");
      formData.append(
        "availableQuantity",
        productData.availableQuantity?.toString() || "0"
      );
      formData.append("discount", productData.discount?.toString() || "0");
      formData.append("color", productData.color || "");
      formData.append("sku", productData.sku || "");

      // Handle arrays - different approaches based on what your backend expects

      // Approach 1: JSON string for arrays
      if (productData.categoryIds && Array.isArray(productData.categoryIds)) {
        formData.append("categoryIds", JSON.stringify(productData.categoryIds));
      }
      if (productData.tagIds && Array.isArray(productData.tagIds)) {
        formData.append("tagIds", JSON.stringify(productData.tagIds));
      }

      // Approach 2: Individual array elements (commented out - use if needed)
      /*
      if (productData.categoryIds && Array.isArray(productData.categoryIds)) {
        productData.categoryIds.forEach((categoryId, index) => {
          formData.append(`categoryIds[${index}]`, categoryId.toString());
        });
      }
      if (productData.tagIds && Array.isArray(productData.tagIds)) {
        productData.tagIds.forEach((tagId, index) => {
          formData.append(`tagIds[${index}]`, tagId.toString());
        });
      }
      */

      // Add images
      if (images && images.length > 0) {
        images.forEach((image) => {
          if (image instanceof File) {
            formData.append("images", image);
          }
        });
      }

      const response = await apiService.post("/api/products", formData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Create product error:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Pure JSON approach (no images)
export const createProductJSON = createAsyncThunk(
  "products/createProductJSON",
  async ({ productData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const jsonData = {
        name: productData.name || "",
        description: productData.description || "",
        price: parseFloat(productData.price) || 0,
        quantity: parseInt(productData.quantity) || 0,
        availableQuantity: parseInt(productData.availableQuantity) || 0,
        discount: parseFloat(productData.discount) || 0,
        color: productData.color || "",
        sku: productData.sku || "",
        categoryIds: productData.categoryIds || [],
        tagIds: productData.tagIds || [],
      };

      const response = await apiService.post("/api/products", jsonData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Create product error:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Two-step approach: Create product then upload images
export const createProductAlternative = createAsyncThunk(
  "products/createProductAlternative",
  async ({ productData, images }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      // First, create the product with JSON data
      const jsonData = {
        name: productData.name || "",
        description: productData.description || "",
        price: parseFloat(productData.price) || 0,
        quantity: parseInt(productData.quantity) || 0,
        availableQuantity: parseInt(productData.availableQuantity) || 0,
        discount: parseFloat(productData.discount) || 0,
        color: productData.color || "",
        sku: productData.sku || "",
        categoryIds: productData.categoryIds || [],
        tagIds: productData.tagIds || [],
      };

      const productResponse = await apiService.post("/api/products", jsonData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      });

      // If images are provided and product was created successfully, upload images
      if (images && images.length > 0 && productResponse.data?.id) {
        const formData = new FormData();
        images.forEach((image) => {
          if (image instanceof File) {
            formData.append("images", image);
          }
        });

        // Upload images to the created product
        await apiService.post(
          `/api/products/${productResponse.data.id}/images`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
      }

      return productResponse.data;
    } catch (error) {
      console.error("Create product alternative error:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update product with images (using raw fetch like createProduct)
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData, images }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      // Create FormData exactly like the working createProduct function
      const formData = new FormData();

      // Create the product JSON string with proper formatting
      const productJson = JSON.stringify(
        {
          name: productData.name || "",
          description: productData.description || "",
          price: parseFloat(productData.price) || 0,
          quantity: parseInt(productData.quantity) || 0,
          availableQuantity: parseInt(productData.availableQuantity) || 0,
          discount: parseFloat(productData.discount) || 0,
          color: productData.color || "",
          sku: productData.sku || "",
          categoryIds: productData.categoryIds || [],
          tagIds: productData.tagIds || [],
        },
        null,
        2
      ); // Pretty format like Postman

      // Add the product data as JSON string
      formData.append("product", productJson);

      // Add images if provided
      if (images && images.length > 0) {
        images.forEach((image) => {
          if (image instanceof File) {
            formData.append("images", image);
          }
        });
      }

      console.log("Update FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      console.log("Update Product JSON being sent:", productJson);

      // Use raw fetch instead of apiService for better error handling (same as createProduct)
      const response = await fetch(`http://localhost:9000/api/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      console.log("Update Response status:", response.status);
      console.log("Update Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update Raw error response:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }

        return rejectWithValue({
          status: response.status,
          statusText: response.statusText,
          message: errorData.message || errorText,
          data: errorData,
        });
      }

      const data = await response.json();
      console.log("Update Success response:", data);
      return data;
    } catch (error) {
      console.error("Update product error:", error);
      console.error("Update Error name:", error.name);
      console.error("Update Error message:", error.message);
      console.error("Update Error stack:", error.stack);

      return rejectWithValue({
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
  }
);

// Alternative: Update product with pure FormData (individual fields) - like createProductWithFormData
export const updateProductWithFormData = createAsyncThunk(
  "products/updateProductWithFormData",
  async ({ id, productData, images }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const formData = new FormData();

      // Add individual product fields
      formData.append("name", productData.name || "");
      formData.append("description", productData.description || "");
      formData.append("price", productData.price?.toString() || "0");
      formData.append("quantity", productData.quantity?.toString() || "0");
      formData.append(
        "availableQuantity",
        productData.availableQuantity?.toString() || "0"
      );
      formData.append("discount", productData.discount?.toString() || "0");
      formData.append("color", productData.color || "");
      formData.append("sku", productData.sku || "");

      // Handle arrays - JSON string approach
      if (productData.categoryIds && Array.isArray(productData.categoryIds)) {
        formData.append("categoryIds", JSON.stringify(productData.categoryIds));
      }
      if (productData.tagIds && Array.isArray(productData.tagIds)) {
        formData.append("tagIds", JSON.stringify(productData.tagIds));
      }

      // Add images
      if (images && images.length > 0) {
        images.forEach((image) => {
          if (image instanceof File) {
            formData.append("images", image);
          }
        });
      }

      console.log("Update with FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Use raw fetch for consistency
      const response = await fetch(`http://localhost:9000/api/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update FormData Raw error response:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }

        return rejectWithValue({
          status: response.status,
          statusText: response.statusText,
          message: errorData.message || errorText,
          data: errorData,
        });
      }

      const data = await response.json();
      console.log("Update FormData Success response:", data);
      return data;
    } catch (error) {
      console.error("Update product FormData error:", error);
      return rejectWithValue({
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
  }
);

// Debug function to test exact structure for updates
export const debugUpdateProduct = createAsyncThunk(
  "products/debugUpdateProduct",
  async ({ id, productData, images }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      // Replicate EXACT structure from your working createProduct
      const formData = new FormData();

      // Use the exact JSON format that works for create
      const productJson = `{
  "name": "${productData.name || "Updated Product"}",
  "description": "${productData.description || "Updated description."}",
  "price": ${parseFloat(productData.price) || 159.0},
  "quantity": ${parseInt(productData.quantity) || 100},
  "availableQuantity": ${parseInt(productData.availableQuantity) || 95},
  "discount": ${parseFloat(productData.discount) || 10.0},
  "color": "${productData.color || "Blue"}",
  "sku": "${productData.sku || "UPD001"}",
  "categoryIds": [${(productData.categoryIds || [1, 2]).join(", ")}],
  "tagIds": [${(productData.tagIds || [1]).join(", ")}]
}`;

      formData.append("product", productJson);

      // Add images
      if (images && images.length > 0) {
        images.forEach((image) => {
          if (image instanceof File) {
            formData.append("images", image);
          }
        });
      }

      console.log("Debug Update - Exact JSON being sent:");
      console.log(productJson);

      console.log("Debug Update - FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Use fetch with PUT method
      const response = await fetch(`http://localhost:9000/api/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Debug Update Raw error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Debug Update Success:", data);
      return data;
    } catch (error) {
      console.error("Debug update product error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Pure JSON approach for updates (no images)
export const updateProductJSON = createAsyncThunk(
  "products/updateProductJSON",
  async ({ id, productData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const jsonData = {
        name: productData.name || "",
        description: productData.description || "",
        price: parseFloat(productData.price) || 0,
        quantity: parseInt(productData.quantity) || 0,
        availableQuantity: parseInt(productData.availableQuantity) || 0,
        discount: parseFloat(productData.discount) || 0,
        color: productData.color || "",
        sku: productData.sku || "",
        categoryIds: productData.categoryIds || [],
        tagIds: productData.tagIds || [],
      };

      // Use raw fetch for consistency
      const response = await fetch(`http://localhost:9000/api/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update JSON Raw error response:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }

        return rejectWithValue({
          status: response.status,
          statusText: response.statusText,
          message: errorData.message || errorText,
          data: errorData,
        });
      }

      const data = await response.json();
      console.log("Update JSON Success response:", data);
      return data;
    } catch (error) {
      console.error("Update product JSON error:", error);
      return rejectWithValue({
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
  }
);

// Two-step approach for updates: Update product then handle images separately
export const updateProductAlternative = createAsyncThunk(
  "products/updateProductAlternative",
  async ({ id, productData, images }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      // First, update the product with JSON data
      const jsonData = {
        name: productData.name || "",
        description: productData.description || "",
        price: parseFloat(productData.price) || 0,
        quantity: parseInt(productData.quantity) || 0,
        availableQuantity: parseInt(productData.availableQuantity) || 0,
        discount: parseFloat(productData.discount) || 0,
        color: productData.color || "",
        sku: productData.sku || "",
        categoryIds: productData.categoryIds || [],
        tagIds: productData.tagIds || [],
      };

      const response = await fetch(`http://localhost:9000/api/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const productResponse = await response.json();

      // If images are provided, upload them separately
      if (images && images.length > 0) {
        const formData = new FormData();
        images.forEach((image) => {
          if (image instanceof File) {
            formData.append("images", image);
          }
        });

        // Upload images to the updated product
        const imageResponse = await fetch(
          `http://localhost:9000/api/products/${id}/images`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
            body: formData,
          }
        );

        if (!imageResponse.ok) {
          console.warn("Failed to upload images, but product was updated");
        }
      }

      return productResponse;
    } catch (error) {
      console.error("Update product alternative error:", error);
      return rejectWithValue({
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await apiService.delete(`/api/products/${id}`, {
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
  products: [],
  selectedProduct: null,
  filters: {
    minPrice: null,
    maxPrice: null,
    period: null,
    specialOffers: false,
    bestsellers: false,
    categoryIds: [],
    tagIds: [],
  },
  loading: false,
  error: null,
  // Loading states for specific operations
  loadingStates: {
    products: false,
    productCreate: false,
    productUpdate: false,
    productDelete: false,
    productDetail: false,
  },
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // Product selection
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },

    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
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
    resetProductState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===============================
      // PRODUCT CASES
      // ===============================

      // Get Products
      .addCase(getProducts.pending, (state) => {
        state.loadingStates.products = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loadingStates.products = false;
        state.products = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loadingStates.products = false;
        state.error = action.payload;
        state.products = [];
      })

      // Get Product By ID
      .addCase(getProductById.pending, (state) => {
        state.loadingStates.productDetail = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loadingStates.productDetail = false;
        state.selectedProduct = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loadingStates.productDetail = false;
        state.error = action.payload;
      })

      // Debug Create Product
      .addCase(debugCreateProduct.pending, (state) => {
        state.loadingStates.productCreate = true;
        state.error = null;
      })
      .addCase(debugCreateProduct.fulfilled, (state, action) => {
        state.loadingStates.productCreate = false;
        if (action.payload) {
          state.products.push(action.payload);
        }
        state.selectedProduct = null;
      })
      .addCase(debugCreateProduct.rejected, (state, action) => {
        state.loadingStates.productCreate = false;
        state.error = action.payload;
      })

      // Create Product (main approach)
      .addCase(createProduct.pending, (state) => {
        state.loadingStates.productCreate = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loadingStates.productCreate = false;
        if (action.payload) {
          state.products.push(action.payload);
        }
        state.selectedProduct = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loadingStates.productCreate = false;
        state.error = action.payload;
      })

      // Create Product with FormData
      .addCase(createProductWithFormData.pending, (state) => {
        state.loadingStates.productCreate = true;
        state.error = null;
      })
      .addCase(createProductWithFormData.fulfilled, (state, action) => {
        state.loadingStates.productCreate = false;
        if (action.payload) {
          state.products.push(action.payload);
        }
        state.selectedProduct = null;
      })
      .addCase(createProductWithFormData.rejected, (state, action) => {
        state.loadingStates.productCreate = false;
        state.error = action.payload;
      })

      // Create Product JSON
      .addCase(createProductJSON.pending, (state) => {
        state.loadingStates.productCreate = true;
        state.error = null;
      })
      .addCase(createProductJSON.fulfilled, (state, action) => {
        state.loadingStates.productCreate = false;
        if (action.payload) {
          state.products.push(action.payload);
        }
        state.selectedProduct = null;
      })
      .addCase(createProductJSON.rejected, (state, action) => {
        state.loadingStates.productCreate = false;
        state.error = action.payload;
      })

      // Create Product Alternative
      .addCase(createProductAlternative.pending, (state) => {
        state.loadingStates.productCreate = true;
        state.error = null;
      })
      .addCase(createProductAlternative.fulfilled, (state, action) => {
        state.loadingStates.productCreate = false;
        if (action.payload) {
          state.products.push(action.payload);
        }
        state.selectedProduct = null;
      })
      .addCase(createProductAlternative.rejected, (state, action) => {
        state.loadingStates.productCreate = false;
        state.error = action.payload;
      })

      // Update Product (main approach - using raw fetch)
      .addCase(updateProduct.pending, (state) => {
        state.loadingStates.productUpdate = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loadingStates.productUpdate = false;
        if (action.payload) {
          const index = state.products.findIndex(
            (product) => product.id === action.payload.id
          );
          if (index !== -1) {
            state.products[index] = action.payload;
          }
        }
        state.selectedProduct = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loadingStates.productUpdate = false;
        state.error = action.payload;
      })

      // Update Product with FormData
      .addCase(updateProductWithFormData.pending, (state) => {
        state.loadingStates.productUpdate = true;
        state.error = null;
      })
      .addCase(updateProductWithFormData.fulfilled, (state, action) => {
        state.loadingStates.productUpdate = false;
        if (action.payload) {
          const index = state.products.findIndex(
            (product) => product.id === action.payload.id
          );
          if (index !== -1) {
            state.products[index] = action.payload;
          }
        }
        state.selectedProduct = null;
      })
      .addCase(updateProductWithFormData.rejected, (state, action) => {
        state.loadingStates.productUpdate = false;
        state.error = action.payload;
      })

      // Debug Update Product
      .addCase(debugUpdateProduct.pending, (state) => {
        state.loadingStates.productUpdate = true;
        state.error = null;
      })
      .addCase(debugUpdateProduct.fulfilled, (state, action) => {
        state.loadingStates.productUpdate = false;
        if (action.payload) {
          const index = state.products.findIndex(
            (product) => product.id === action.payload.id
          );
          if (index !== -1) {
            state.products[index] = action.payload;
          }
        }
        state.selectedProduct = null;
      })
      .addCase(debugUpdateProduct.rejected, (state, action) => {
        state.loadingStates.productUpdate = false;
        state.error = action.payload;
      })

      // Update Product JSON
      .addCase(updateProductJSON.pending, (state) => {
        state.loadingStates.productUpdate = true;
        state.error = null;
      })
      .addCase(updateProductJSON.fulfilled, (state, action) => {
        state.loadingStates.productUpdate = false;
        if (action.payload) {
          const index = state.products.findIndex(
            (product) => product.id === action.payload.id
          );
          if (index !== -1) {
            state.products[index] = action.payload;
          }
        }
        state.selectedProduct = null;
      })
      .addCase(updateProductJSON.rejected, (state, action) => {
        state.loadingStates.productUpdate = false;
        state.error = action.payload;
      })

      // Update Product Alternative
      .addCase(updateProductAlternative.pending, (state) => {
        state.loadingStates.productUpdate = true;
        state.error = null;
      })
      .addCase(updateProductAlternative.fulfilled, (state, action) => {
        state.loadingStates.productUpdate = false;
        if (action.payload) {
          const index = state.products.findIndex(
            (product) => product.id === action.payload.id
          );
          if (index !== -1) {
            state.products[index] = action.payload;
          }
        }
        state.selectedProduct = null;
      })
      .addCase(updateProductAlternative.rejected, (state, action) => {
        state.loadingStates.productUpdate = false;
        state.error = action.payload;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loadingStates.productDelete = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loadingStates.productDelete = false;
        state.products = state.products.filter(
          (product) => product.id !== action.payload
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loadingStates.productDelete = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedProduct,
  clearSelectedProduct,
  setFilters,
  clearFilters,
  clearError,
  resetLoadingStates,
  resetProductState,
} = productSlice.actions;

export default productSlice.reducer;

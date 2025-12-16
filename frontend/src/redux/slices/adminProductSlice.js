import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance.js"; // ← UPDATED

// async thunk to fetch admin products
export const fetchAdminProducts = createAsyncThunk(
  "adminProducts/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/admin/products"); // ← UPDATED
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
    }
  }
);

// async function to create a new product
export const createProduct = createAsyncThunk(
  "adminProducts/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/admin/products",
        productData
      ); // ← UPDATED
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create product");
    }
  }
);

// async thunk to update an existing product
export const updateProduct = createAsyncThunk(
  "adminProducts/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/api/products/${id}`,
        productData
      ); // ← UPDATED
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update product");
    }
  }
);

// async thunk to delete a product
export const deleteProduct = createAsyncThunk(
  "adminProducts/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/admin/products/${id}`); // ← UPDATED
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete product");
    }
  }
);

const adminProductSlice = createSlice({
  name: "adminProducts",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Create product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })

      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (product) => product._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })

      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (product) => product._id !== action.payload
        );
      });
  },
});

export default adminProductSlice.reducer;
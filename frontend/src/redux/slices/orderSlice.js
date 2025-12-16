import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance.js"; // ← UPDATED (was axios)

// Fetch user orders
export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/orders/my-orders"); // ← UPDATED
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to fetch orders";
      return rejectWithValue({ message: msg });
    }
  }
);

// Fetch single order details
export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/orders/${orderId}`); // ← UPDATED
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to fetch order";
      return rejectWithValue({ message: msg });
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    totalOrders: 0,
    orderDetails: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
        state.totalOrders = action.payload?.length || 0;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load orders";
      })

      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load order details";
      });
  },
});

export const { clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
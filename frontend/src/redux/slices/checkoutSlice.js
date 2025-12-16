import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance.js"; // ← UPDATED

// CREATE CHECKOUT
export const createCheckout = createAsyncThunk(
  "checkout/createCheckout",
  async (checkoutData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/checkout", checkoutData); // ← UPDATED
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Checkout failed";
      return rejectWithValue({ message: msg });
    }
  }
);

// INITIATE KHALTI PAYMENT
export const initiateKhaltiPayment = createAsyncThunk(
  "checkout/initiateKhaltiPayment",
  async (checkoutId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/api/checkout/${checkoutId}/initiateKhalti`, // ← FIXED: matches backend route (no hyphen)
        {}
      ); // ← UPDATED
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to initiate Khalti payment";
      return rejectWithValue({ message: msg });
    }
  }
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    checkout: null,
    loading: false,
    error: null,
    success: false,
    paymentLoading: false,
    paymentError: null,
  },
  reducers: {
    clearCheckoutError: (state) => {
      state.error = null;
      state.paymentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload;
        state.success = true;
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Checkout failed";
        state.success = false;
      })

      .addCase(initiateKhaltiPayment.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
      })
      .addCase(initiateKhaltiPayment.fulfilled, (state) => {
        state.paymentLoading = false;
      })
      .addCase(initiateKhaltiPayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.payload?.message || "Payment initiation failed";
      });
  },
});

export const { clearCheckoutError } = checkoutSlice.actions;
export default checkoutSlice.reducer;
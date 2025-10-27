import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createCheckout = createAsyncThunk(
  "checkout/createCheckout",
  async (checkoutdata, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
      console.log("Checkout payload sent:", checkoutdata);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout`,
        checkoutdata,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Checkout response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Checkout error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || { message: "Checkout failed" }
      );
    }
  }
);

export const verifyKhaltiPayment = createAsyncThunk(
  "checkout/verifyKhaltiPayment",
  async ({ pidx, orderId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/verify-payment`,
        { pidx, orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Payment verification failed" }
      );
    }
  }
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    checkout: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload;
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Checkout failed";
      })
      .addCase(verifyKhaltiPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyKhaltiPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = {
          ...state.checkout,
          verified: true,
          order: action.payload,
        };
      })
      .addCase(verifyKhaltiPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Payment verification failed";
      });
  },
});

export default checkoutSlice.reducer;
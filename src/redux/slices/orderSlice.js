import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios'; // Your axios instance

// Book Buyer Data fetched
export const fetchBookOrders = createAsyncThunk(
  'orders/fetchBookOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/bookorders');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch book orders');
    }
  }
);

console.log("Book Fetched data is show here", fetchBookOrders);

// Async Thunks
export const fetchPaidOrders = createAsyncThunk(
  'orders/fetchPaidOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/orders/paid'); // Adjust API endpoint as needed
      return response.data; // Assuming the API response contains a `data` property with the orders
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Something went wrong');
    }
  }
);

// Orders Slice
const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    paidOrders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Paid Orders
      .addCase(fetchPaidOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaidOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.paidOrders = action.payload.data; // Adjust based on API structure
      })
      .addCase(fetchPaidOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
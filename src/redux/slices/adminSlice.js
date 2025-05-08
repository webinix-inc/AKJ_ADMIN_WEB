import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAuthToken } from "../../api/axios"; // Your axios instance

// Async Thunks
export const registerAdmin = createAsyncThunk(
  "admin/registerAdmin",
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/registration", adminData);
      return response.data; // Assuming the API returns the created user data
    } catch (error) {
      return rejectWithValue(error.response.data); // Handle and return error
    }
  }
);

export const loginAdmin = createAsyncThunk(
  "admin/loginAdmin",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/login", loginData);
      const { accessToken } = await response.data;
      // console.log(response.data, "response data");
      setAuthToken(accessToken);
       // Set token for future requests
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data); // Handle and return error
    }
  }
);

// Admin Slice
const adminSlice = createSlice({
  name: "admin",
  initialState: {
    adminData: null,
    loading: false,
    error: null,
  },
  reducers: {
    logoutAdmin: (state) => {
      state.adminData = null;
      setAuthToken(null); // Remove token on logout
    },
  },
  extraReducers: (builder) => {
    builder
      // Register Admin
      .addCase(registerAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminData = action.payload;
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login Admin
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminData = action.payload;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutAdmin } = adminSlice.actions;

export default adminSlice.reducer;

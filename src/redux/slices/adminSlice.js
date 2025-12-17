import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { setAuthToken } from "../../api/axios"; // Your axios instance

// Async Thunks
export const registerAdmin = createAsyncThunk(
  "admin/registerAdmin",
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/registration", adminData);
      return response.data; // Assuming the API returns the created user data
    } catch (error) {
      // Handle errors properly - check if error.response exists
      const errorMessage = error.response?.data || { message: error.message || "Network error occurred" };
      return rejectWithValue(errorMessage); // Handle and return error
    }
  }
);

export const loginAdmin = createAsyncThunk(
  "admin/loginAdmin",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/login", loginData);
      console.log("Login response:", response.data); // Debug log
      
      // Handle response data structure - backend returns { data: {...}, accessToken: "..." }
      const responseData = response.data;
      const accessToken = responseData?.accessToken;
      
      if (accessToken) {
        setAuthToken(accessToken);
        return responseData;
      } else {
        console.warn("No accessToken in response:", responseData);
        return rejectWithValue({ message: "Invalid response from server" });
      }
    } catch (error) {
      console.error("Login error:", error); // Debug log
      
      // Handle errors properly - check if error.response exists
      let errorMessage;
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data || { message: error.response.statusText || "Server error occurred" };
      } else if (error.request) {
        // Request was made but no response received (network error, timeout, etc.)
        errorMessage = { message: "Network error: Unable to connect to server. Please check your connection." };
      } else {
        // Something else happened
        errorMessage = { message: error.message || "An unexpected error occurred" };
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Register admin in MeritHub
export const registerAdminInMeritHub = createAsyncThunk(
  "admin/registerAdminInMeritHub",
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/register-merithub", adminData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data || { message: error.message || "Failed to register in MeritHub" };
      return rejectWithValue(errorMessage);
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
      state.loading = false;
      state.error = null;
      setAuthToken(null); // Remove token on logout
    },
    resetLoginState: (state) => {
      state.loading = false;
      state.error = null;
    },
    updateAdminMerithubId: (state, action) => {
      if (state.adminData && state.adminData.data) {
        state.adminData.data.merithubUserId = action.payload;
      }
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
      })
      // Register Admin in MeritHub
      .addCase(registerAdminInMeritHub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAdminInMeritHub.fulfilled, (state, action) => {
        state.loading = false;
        // Update adminData with new merithubUserId
        if (state.adminData && state.adminData.data && action.payload.merithubUserId) {
          state.adminData.data.merithubUserId = action.payload.merithubUserId;
        }
      })
      .addCase(registerAdminInMeritHub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutAdmin, resetLoginState, updateAdminMerithubId } = adminSlice.actions;

export default adminSlice.reducer;

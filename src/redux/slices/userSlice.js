import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios'; // Adjust to your axios instance

// Async Thunks

// Fetch a user's profile by ID
export const fetchUserProfileById = createAsyncThunk(
  'user/fetchUserProfileById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/getUserProfile/${userId}`);
      return response.data.data; // Assuming the API returns the user's profile in `data`
    } catch (error) {
      return rejectWithValue(error.response.data); // Handle and return the error
    }
  }
);

// Fetch all user profiles (if required for a list)
export const fetchAllUserProfiles = createAsyncThunk(
  'user/fetchAllUserProfiles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.put('/user/getAllProfile'); // Adjust the route if necessary
      return response.data.data; // Assuming the API returns an array of profiles in `data`
    } catch (error) {
      return rejectWithValue(error.response.data); // Handle and return the error
    }
  }
);

// User Slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    selectedUser: null, // Stores a single user's profile for detailed view
    allUsers: [], // Stores all user profiles
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null; // Clear errors
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null; // Clear selected user data
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch a User Profile by ID
      .addCase(fetchUserProfileById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserProfileById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch All User Profiles
      .addCase(fetchAllUserProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUserProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.allUsers = action.payload;
      })
      .addCase(fetchAllUserProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedUser } = userSlice.actions;

export default userSlice.reducer;

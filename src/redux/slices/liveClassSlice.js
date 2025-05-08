import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios"; // Replace with your axios instance

// Async Thunks
export const createLiveUser = createAsyncThunk(
  "liveClasses/createLiveUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/live-users", userData);
      return response.data; // Assuming the API returns the created user data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message); // Handle and return error
    }
  }
);

export const fetchUpcomingClasses = createAsyncThunk(
  "liveClasses/fetchUpcomingClasses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/upcoming-live-classes");
      return response.data; // Assuming the API returns the list of upcoming classes
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message); // Handle and return error
    }
  }
);

export const scheduleLiveClass = createAsyncThunk(
  "liveClasses/scheduleLiveClass",
  async (classData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/live-classes", classData);
      return response.data; // Assuming the API returns the scheduled class data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message); // Handle and return error
    }
  }
);
// New Async Thunk for editing live classes
export const editLiveClass = createAsyncThunk(
  "liveClasses/editLiveClass",
  async ({ classId, updateDetails }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/edit-live-classes/${classId}`, updateDetails);
      return response.data; // Assuming the API returns the updated class data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteLiveClass = createAsyncThunk(
  "liveClasses/deleteLiveClass",
  async (classId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/delete-live-classes/${classId}`);
      return { classId }; // Return the classId of the deleted class
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



// Live Class Slice
const liveClassSlice = createSlice({
  name: "liveClasses",
  initialState: {
    users: [], // For storing created users
    liveClasses: [], // For storing scheduled classes
    upcomingClasses: [], // Array to store upcoming live classes
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Live User
      .addCase(createLiveUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLiveUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload.user); // Add the created user to the state
      })
      .addCase(createLiveUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Schedule Live Class
      .addCase(scheduleLiveClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scheduleLiveClass.fulfilled, (state, action) => {
        state.loading = false;
        state.liveClasses.push(action.payload.liveClass); // Add the scheduled class to the state
      })
      .addCase(scheduleLiveClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Upcoming Live Classes
      .addCase(fetchUpcomingClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingClasses = action.payload.classes; // Store the fetched upcoming classes
      })
      .addCase(fetchUpcomingClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle states for editLiveClass
      .addCase(editLiveClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editLiveClass.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.liveClasses.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.liveClasses[index] = action.payload;
        }
      })
      .addCase(editLiveClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Live Class
      .addCase(deleteLiveClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLiveClass.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted class from the state
        state.liveClasses = state.liveClasses.filter(
          liveClass => liveClass.id !== action.payload.classId
        );
      })
      .addCase(deleteLiveClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default liveClassSlice.reducer;

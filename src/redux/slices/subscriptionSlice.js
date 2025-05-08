import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios"; // Your axios instance

// Async Thunks
// Create a new subscription
export const createSubscription = createAsyncThunk(
  "subscription/createSubscription",
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/subscriptions", subscriptionData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch all subscriptions
export const getAllSubscriptions = createAsyncThunk(
  "subscription/getAllSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/subscriptions");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch a subscription by ID
export const getSubscriptionById = createAsyncThunk(
  "subscription/getSubscriptionById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/subscriptions/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update a subscription
export const updateSubscription = createAsyncThunk(
  "subscription/updateSubscription",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/subscriptions/${id}`, updateData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete a subscription
export const deleteSubscription = createAsyncThunk(
  "subscription/deleteSubscription",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/subscriptions/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch subscriptions by courseId and return only plan names
export const getSubscriptionsByCourseId = createAsyncThunk(
  "subscription/getSubscriptionsByCourseId",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/admin/user-subscriptions-course/${courseId}`
      );
      return response.data.data; // Assuming the response contains an array of plan names
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch subscriptions by course ID."
      );
    }
  }
);

// Slice
const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    subscriptions: [],
    subscriptionDetails: null,
    subscriptionsByCourse: [], // New state field for subscriptions by course
    loading: false,
    error: null,
  },
  reducers: {
    clearSubscriptionDetails: (state) => {
      state.subscriptionDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Subscription
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions.push(action.payload); // Add the new subscription to the list
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All Subscriptions
      .addCase(getAllSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload; // Set the list of subscriptions
      })
      .addCase(getAllSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Subscription by ID
      .addCase(getSubscriptionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionById.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptionDetails = action.payload; // Set the details of the specific subscription
      })
      .addCase(getSubscriptionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Subscription
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptionDetails = action.payload; // Update the specific subscription details
        state.subscriptions = state.subscriptions.map((subscription) =>
          subscription._id === action.payload._id
            ? action.payload
            : subscription
        );
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Subscription
      .addCase(deleteSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = state.subscriptions.filter(
          (subscription) => subscription._id !== action.meta.arg
        ); // Remove the deleted subscription
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Subscriptions by Course ID
      .addCase(getSubscriptionsByCourseId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionsByCourseId.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptionsByCourse = action.payload; // Store the list of plan names
      })
      .addCase(getSubscriptionsByCourseId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubscriptionDetails } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;

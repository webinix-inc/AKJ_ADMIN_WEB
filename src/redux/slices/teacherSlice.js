import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAuthToken } from "../../api/axios"; // Your axios instance

// Async Thunks

// Register Teacher
export const registerTeacher = createAsyncThunk(
  "teacher/registerTeacher",
  async ({ teacherData }, { rejectWithValue }) => {
    try {

      const response = await api.post("/teacher/signup", teacherData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data; // Assuming API returns the created teacher data
    } catch (error) {
      return rejectWithValue(error.response.data); // Handle and return error
    }
  }
);

// Teacher Slice
const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    teacherData: null,
    loading: false,
    error: null,
  },
  reducers: {
    logoutTeacher: (state) => {
      state.teacherData = null;
      setAuthToken(null); // Remove token on logout
    },
  },
  extraReducers: (builder) => {
    builder
      // Register Teacher
      .addCase(registerTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerTeacher.fulfilled, (state, action) => {
        state.loading = false;
        state.teacherData = action.payload;
      })
      .addCase(registerTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutTeacher } = teacherSlice.actions;

export default teacherSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios"; // Your axios instance configured for the API

// Async Thunks

export const uploadVideoToFolder = createAsyncThunk(
  "content/uploadVideoToFolder",
  async ({ folderId, formData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/admin/uploadCourseVideo/${folderId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return { folderId, videos: response.data.data }; // Adapt this line based on actual API response structure
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Create Folder
export const createFolder = createAsyncThunk(
  "content/createFolder",
  async (folderData, { rejectWithValue }) => {
    try {
      const response = await api.post("/courses/create-folder", folderData);
      return response.data.newFolder;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Add Subfolder
export const addSubfolder = createAsyncThunk(
  "content/addSubfolder",
  async ({ folderId, subfolderData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/folders/${folderId}/add-subfolder`,
        subfolderData
      );
      return { subfolder: response?.data.subfolder, parentFolderId: folderId };
    } catch (error) {
      return rejectWithValue(error?.response.data);
    }
  }
);

// Add File to Folder
export const addFileToFolder = createAsyncThunk(
  "content/addFileToFolder",
  async ({ folderId, fileData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/folders/${folderId}/add-file`,
        fileData
      );
      return { file: response.data.file, folderId: folderId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get Folder Contents
export const getFolderContents = createAsyncThunk(
  "content/getFolderContents",
  async (folderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/folders/${folderId}`);
      return { folderId, folder: response.data.folder };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete Folder
export const deleteFolder = createAsyncThunk(
  "content/deleteFolder",
  async ({ folderId, sourceFolderId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/folders/${folderId}`, {
        data: { sourceFolderId }, // Include sourceFolderId in the request body
      });
      return { folderId, sourceFolderId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete File from Folder
export const deleteFileFromFolder = createAsyncThunk(
  "content/deleteFileFromFolder",
  async ({ folderId, fileId }, { rejectWithValue }) => {
    try {
      await api.delete(`/folders/${folderId}/files/${fileId}`);
      return { folderId, fileId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update Folder
export const updateFolder = createAsyncThunk(
  "content/updateFolder",
  async ({ id, folderData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/folders/${id}`, folderData);
      return response.data.folder;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async Thunk for updating a file
export const updateFileInFolder = createAsyncThunk(
  "content/updateFileInFolder",
  async ({ folderId, fileId, fileData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/folders/${folderId}/files/${fileId}`,
        fileData
      );
      return { file: response.data.updatedFile, folderId, fileId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async Thunks for moving files and folders
export const moveFileToFolder = createAsyncThunk(
  "content/moveFileToFolder",
  async (
    { fileIds, sourceFolderId, destinationFolderId },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("files/move", {
        fileIds,
        sourceFolderId,
        destinationFolderId,
      });
      return response.data; // Adapt this line based on the actual API response structure
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const moveFolderToFolder = createAsyncThunk(
  "content/moveFolderToFolder",
  async (
    { folderId, sourceFolderId, destinationFolderId },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/folders/move", {
        folderId,
        sourceFolderId,
        destinationFolderId,
      });
      return response.data; // Adapt this line based on the actual API response structure
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateFileOrder = createAsyncThunk(
  "content/updateFileOrder",
  async ({ folderId, fileIds }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/folders/${folderId}/update-order`, {
        fileIds,
      });
      return { folderId, updatedFolder: response.data.folder }; // Adjust based on actual response structure
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Content Slice
const contentSlice = createSlice({
  name: "content",
  initialState: {
    folders: {}, // Stores folders by their IDs for efficient access and manipulation
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createFolder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.loading = false;
        state.folders[action.payload._id] = action.payload;
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addSubfolder.pending, (state) => {
        state.loading = true;
      })
      .addCase(addSubfolder.fulfilled, (state, action) => {
        state.loading = false;
        const { subfolder, parentFolderId } = action.payload;
        const parentFolder = state.folders[parentFolderId];
        if (parentFolder) {
          if (!parentFolder.folders) {
            parentFolder.folders = [];
          }
          parentFolder.folders.push(subfolder);
        }
      })

      .addCase(addSubfolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addFileToFolder.pending, (state) => {
        state.loading = true;
      })
      .addCase(addFileToFolder.fulfilled, (state, action) => {
        state.loading = false;
        const { file, folderId } = action.payload;
        if (state.folders[folderId]) {
          state.folders[folderId].files.push(file);
        }
      })
      .addCase(addFileToFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getFolderContents.pending, (state) => {
        state.loading = true;
        state.error = null; // Reset error on new request
      })
      .addCase(getFolderContents.fulfilled, (state, action) => {
        state.loading = false;
        const { folderId, folder } = action.payload;
        if (
          !state.folders[folderId] ||
          JSON.stringify(state.folders[folderId]) !== JSON.stringify(folder)
        ) {
          state.folders[folderId] = folder;
        }
      })
      .addCase(getFolderContents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteFolder.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.loading = false;
        delete state.folders[action.payload];
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteFileFromFolder.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteFileFromFolder.fulfilled, (state, action) => {
        state.loading = false;
        const { folderId, fileId } = action.payload;
        if (state.folders[folderId]) {
          state.folders[folderId].files = state.folders[folderId].files.filter(
            (file) => file._id !== fileId
          );
        }
      })
      .addCase(deleteFileFromFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateFolder.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFolder.fulfilled, (state, action) => {
        state.loading = false;
        state.folders[action.payload._id] = action.payload;
      })
      .addCase(updateFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle updating a file within a folder
      .addCase(updateFileInFolder.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFileInFolder.fulfilled, (state, action) => {
        state.loading = false;
        const { file, folderId, fileId } = action.payload;
        if (state.folders[folderId]) {
          const fileIndex = state.folders[folderId].files.findIndex(
            (f) => f._id === fileId
          );
          if (fileIndex !== -1) {
            state.folders[folderId].files[fileIndex] = file;
          }
        }
      })
      .addCase(updateFileInFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(moveFileToFolder.pending, (state) => {
        state.loading = true;
      })
      .addCase(moveFileToFolder.fulfilled, (state, action) => {
        state.loading = false;
        // Handle state update if necessary
      })
      .addCase(moveFileToFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(moveFolderToFolder.pending, (state) => {
        state.loading = true;
      })
      .addCase(moveFolderToFolder.fulfilled, (state, action) => {
        state.loading = false;
        // Handle state update if necessary
      })
      .addCase(moveFolderToFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(updateFileOrder.pending, (state) => {
        state.loading = true;
        state.error = null; // Reset errors on new request
      })
      .addCase(updateFileOrder.fulfilled, (state, action) => {
        state.loading = false;
        const { folderId, updatedFolder } = action.payload;
        if (state.folders[folderId]) {
          state.folders[folderId] = updatedFolder; // Update the folder with the new order
        }
      })
      .addCase(updateFileOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default contentSlice.reducer;

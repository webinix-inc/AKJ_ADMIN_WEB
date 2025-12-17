import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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
const initialState = {
  folders: {}, // Stores folders by their IDs for efficient access and manipulation
  loadingByFolder: {},
  operationLoading: {},
  error: null,
};

// Ensure state properties are initialized (works with Immer draft state)
const ensureStateInitialized = (state) => {
  if (!state) return;
  if (!state.folders || typeof state.folders !== 'object') {
    state.folders = {};
  }
  if (!state.loadingByFolder || typeof state.loadingByFolder !== 'object') {
    state.loadingByFolder = {};
  }
  if (!state.operationLoading || typeof state.operationLoading !== 'object') {
    state.operationLoading = {};
  }
  if (state.error === undefined) {
    state.error = null;
  }
};

const setOperationLoading = (state, typePrefix, isLoading) => {
  if (!typePrefix) return;
  ensureStateInitialized(state);
  state.operationLoading[typePrefix] = isLoading;
};

const syncChildReferences = (state, updatedFolder) => {
  if (!updatedFolder?._id) return;
  ensureStateInitialized(state);
  if (!state.folders || typeof state.folders !== 'object') return;
  Object.values(state.folders).forEach((folder) => {
    if (!folder?.folders?.length) return;
    folder.folders = folder.folders.map((child) => {
      const childId = typeof child === "string" ? child : child?._id;
      if (childId === updatedFolder._id) {
        return updatedFolder;
      }
      return child;
    });
  });
};

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    // Reset state to initial if needed (for debugging/recovery)
    resetContentState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createFolder.pending, (state) => {
        setOperationLoading(state, createFolder.typePrefix, true);
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        setOperationLoading(state, createFolder.typePrefix, false);
        ensureStateInitialized(state);
        if (action.payload?._id) {
          if (!state.folders) {
            state.folders = {};
          }
          state.folders[action.payload._id] = action.payload;
        }
      })
      .addCase(createFolder.rejected, (state, action) => {
        setOperationLoading(state, createFolder.typePrefix, false);
        state.error = action.payload;
      })
      .addCase(addSubfolder.pending, (state) => {
        setOperationLoading(state, addSubfolder.typePrefix, true);
      })
      .addCase(addSubfolder.fulfilled, (state, action) => {
        setOperationLoading(state, addSubfolder.typePrefix, false);
        ensureStateInitialized(state);
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
        setOperationLoading(state, addSubfolder.typePrefix, false);
        state.error = action.payload;
      })
      .addCase(addFileToFolder.pending, (state) => {
        setOperationLoading(state, addFileToFolder.typePrefix, true);
      })
      .addCase(addFileToFolder.fulfilled, (state, action) => {
        setOperationLoading(state, addFileToFolder.typePrefix, false);
        ensureStateInitialized(state);
        const { file, folderId } = action.payload;
        if (state.folders[folderId]) {
          state.folders[folderId].files.push(file);
        }
      })
      .addCase(addFileToFolder.rejected, (state, action) => {
        setOperationLoading(state, addFileToFolder.typePrefix, false);
        state.error = action.payload;
      })
      .addCase(getFolderContents.pending, (state, action) => {
        ensureStateInitialized(state);
        const folderId = action.meta.arg;
        if (folderId) {
          state.loadingByFolder[folderId] = true;
        }
        state.error = null; // Reset error on new request
      })
      .addCase(getFolderContents.fulfilled, (state, action) => {
        ensureStateInitialized(state);
        const { folderId, folder } = action.payload;
        if (folderId && folder) {
          if (!state.folders) {
            state.folders = {};
          }
          state.loadingByFolder[folderId] = false;
          state.folders[folderId] = folder;
        }
      })
      .addCase(getFolderContents.rejected, (state, action) => {
        ensureStateInitialized(state);
        const folderId = action.meta.arg;
        if (folderId) {
          state.loadingByFolder[folderId] = false;
        }
        state.error = action.payload;
      })
      .addCase(deleteFolder.pending, (state) => {
        setOperationLoading(state, deleteFolder.typePrefix, true);
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        setOperationLoading(state, deleteFolder.typePrefix, false);
        ensureStateInitialized(state);
        const { folderId, sourceFolderId } = action.payload;
        if (folderId) {
          delete state.folders[folderId];
        }
        if (sourceFolderId && state.folders[sourceFolderId]) {
          state.folders[sourceFolderId].folders = state.folders[
            sourceFolderId
          ].folders?.filter((child) => {
            const childId = typeof child === "string" ? child : child?._id;
            return childId !== folderId;
          });
        }
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        setOperationLoading(state, deleteFolder.typePrefix, false);
        state.error = action.payload;
      })
      .addCase(deleteFileFromFolder.pending, (state) => {
        setOperationLoading(state, deleteFileFromFolder.typePrefix, true);
      })
      .addCase(deleteFileFromFolder.fulfilled, (state, action) => {
        setOperationLoading(state, deleteFileFromFolder.typePrefix, false);
        ensureStateInitialized(state);
        const { folderId, fileId } = action.payload;
        if (state.folders[folderId]) {
          state.folders[folderId].files = state.folders[folderId].files.filter(
            (file) => file._id !== fileId
          );
        }
      })
      .addCase(deleteFileFromFolder.rejected, (state, action) => {
        setOperationLoading(state, deleteFileFromFolder.typePrefix, false);
        state.error = action.payload;
      })
      .addCase(updateFolder.pending, (state) => {
        setOperationLoading(state, updateFolder.typePrefix, true);
      })
      .addCase(updateFolder.fulfilled, (state, action) => {
        setOperationLoading(state, updateFolder.typePrefix, false);
        ensureStateInitialized(state);
        if (action.payload?._id) {
          if (!state.folders) {
            state.folders = {};
          }
          state.folders[action.payload._id] = action.payload;
          syncChildReferences(state, action.payload);
        }
      })
      .addCase(updateFolder.rejected, (state, action) => {
        setOperationLoading(state, updateFolder.typePrefix, false);
        state.error = action.payload;
      })
      // Handle updating a file within a folder
      .addCase(updateFileInFolder.pending, (state) => {
        setOperationLoading(state, updateFileInFolder.typePrefix, true);
      })
      .addCase(updateFileInFolder.fulfilled, (state, action) => {
        setOperationLoading(state, updateFileInFolder.typePrefix, false);
        ensureStateInitialized(state);
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
        setOperationLoading(state, updateFileInFolder.typePrefix, false);
        state.error = action.payload;
      })
      .addCase(moveFileToFolder.pending, (state) => {
        setOperationLoading(state, moveFileToFolder.typePrefix, true);
      })
      .addCase(moveFileToFolder.fulfilled, (state) => {
        setOperationLoading(state, moveFileToFolder.typePrefix, false);
      })
      .addCase(moveFileToFolder.rejected, (state, action) => {
        setOperationLoading(state, moveFileToFolder.typePrefix, false);
        state.error = action.payload;
      })
      .addCase(moveFolderToFolder.pending, (state) => {
        setOperationLoading(state, moveFolderToFolder.typePrefix, true);
      })
      .addCase(moveFolderToFolder.fulfilled, (state) => {
        setOperationLoading(state, moveFolderToFolder.typePrefix, false);
      })
      .addCase(moveFolderToFolder.rejected, (state, action) => {
        setOperationLoading(state, moveFolderToFolder.typePrefix, false);
        state.error = action.payload;
      })
      .addCase(updateFileOrder.pending, (state, action) => {
        ensureStateInitialized(state);
        const folderId = action.meta.arg?.folderId;
        if (folderId) {
          state.loadingByFolder[folderId] = true;
        }
        state.error = null; // Reset errors on new request
      })
      .addCase(updateFileOrder.fulfilled, (state, action) => {
        ensureStateInitialized(state);
        const { folderId, updatedFolder } = action.payload;
        if (folderId && updatedFolder) {
          if (!state.folders) {
            state.folders = {};
          }
          state.loadingByFolder[folderId] = false;
          state.folders[folderId] = updatedFolder;
          syncChildReferences(state, updatedFolder);
        }
      })
      .addCase(updateFileOrder.rejected, (state, action) => {
        ensureStateInitialized(state);
        const folderId = action.meta.arg?.folderId;
        if (folderId) {
          state.loadingByFolder[folderId] = false;
        }
        state.error = action.payload;
      });
  },
});

export default contentSlice.reducer;

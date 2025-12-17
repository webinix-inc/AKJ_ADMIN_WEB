import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Fetch all courses
export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/courses");
      return response.data.data; // Assuming the courses are in `data` field
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch a single course by ID
export const fetchCourseById = createAsyncThunk(
  "courses/fetchCourseById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/courses/${id}`);
      return response.data.data; // Assuming the course data is inside `data`
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Create a new course
export const createCourse = createAsyncThunk(
  "courses/createCourse",
  async (courseData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/courses/add", courseData, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure this is set for file uploads
        },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error in createCourse thunk:", error);
      let errorMessage = "An unexpected error occurred.";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Update an existing course
export const updateCourse = createAsyncThunk(
  "courses/updateCourse",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/courses/${id}`, updatedData, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure this is set for file uploads
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Delete a course by ID
export const deleteCourse = createAsyncThunk(
  "courses/deleteCourse",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/courses/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Toggle course publish status
export const togglePublishCourse = createAsyncThunk(
  "courses/togglePublishCourse",
  async ({ courseId, isPublished }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/courses/${courseId}/toggle-publish`, {
        isPublished: isPublished
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error toggling course publish status"
      );
    }
  }
);

// Fetch all course categories by main course ID
export const fetchCategoriesByCourseId = createAsyncThunk(
  "categories/fetchCategoriesByCourseId",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/Category/allCategory/${courseId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch all course categories
export const fetchAllCategories = createAsyncThunk(
  "categories/fetchAllCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/Category/getAllCategory");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Create a new course category
export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/admin/Category/createCategory",
        categoryData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data;
    } catch (error) {
      let errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      return rejectWithValue(errorMessage);
    }
  }
);
// Update an existing course category
export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/admin/Category/update/${id}`,
        updatedData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Delete a course category by ID
export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/Category/remove/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Fetch all subcategories for a specific category
export const fetchSubCategories = createAsyncThunk(
  "subCategories/fetchSubCategories",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/admin/Category/${categoryId}/subCategories`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching subcategories."
      );
    }
  }
);

// Create a new subcategory within a specific category
export const createSubCategory = createAsyncThunk(
  "subCategories/createSubCategory",
  async ({ categoryId, subCategoryData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/admin/Category/${categoryId}/createSubCategory`,
        subCategoryData
      );
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error creating subcategory.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Update an existing subcategory within a specific category
export const updateSubCategory = createAsyncThunk(
  "subCategories/updateSubCategory",
  async ({ categoryId, subCategoryId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/admin/Category/${categoryId}/updateSubCategory/${subCategoryId}`,
        updatedData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error updating subcategory."
      );
    }
  }
);

// Delete a subcategory within a specific category
export const deleteSubCategory = createAsyncThunk(
  "subCategories/deleteSubCategory",
  async ({ categoryId, subCategoryId }, { rejectWithValue }) => {
    try {
      await api.delete(
        `/admin/Category/${categoryId}/removeSubCategory/${subCategoryId}`
      );
      return subCategoryId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error deleting subcategory."
      );
    }
  }
);

// Create Subject
export const createSubject = createAsyncThunk(
  "subjects/createSubject",
  async (subjectData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/subjects", subjectData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get All Subjects
export const getAllSubjects = createAsyncThunk(
  "subjects/getAllSubjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/subjects");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get Subject by ID
export const getSubjectById = createAsyncThunk(
  "subjects/getSubjectById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/subjects/${id}`);
      return response.data.data[0];
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update Subject by ID
export const updateSubjectById = createAsyncThunk(
  "subjects/updateSubjectById",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/subjects/${id}`, updatedData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete Subject by ID
export const deleteSubjectById = createAsyncThunk(
  "subjects/deleteSubjectById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/subjects/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
// Create Chapter
export const createChapter = createAsyncThunk(
  "chapters/createChapter",
  async (chapterData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/admin/subjects/${chapterData.subjectId}/chapters`,
        chapterData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
// Get All Chapters
export const getAllChapters = createAsyncThunk(
  "chapters/getAllChapters",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/chapters");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get Chapter by ID
export const getChapterById = createAsyncThunk(
  "chapters/getChapterById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/chapters/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update Chapter by ID
export const updateChapterById = createAsyncThunk(
  "chapters/updateChapterById",
  async ({ subjectId, chapterId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/admin/subjects/${subjectId}/chapters/${chapterId}`,
        updatedData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete Chapter by ID
export const deleteChapterById = createAsyncThunk(
  "chapters/deleteChapterById",
  async ({ subjectId, chapterId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/admin/subjects/${subjectId}/chapters/${chapterId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Add a thunk for updating the course publication status
export const updateCourseStatus = createAsyncThunk(
  "courses/updateCourseStatus",
  async ({ id, isPublished }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/courses/${id}/toggle-publish`, {
        isPublished,
      });
      return response.data.data; // Assuming the updated course is in `data`
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error updating course status."
      );
    }
  }
);

// Fetch the enrollment count for a specific course
export const fetchEnrollmentCount = createAsyncThunk(
  "courses/fetchEnrollmentCount",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/admin/count/${courseId}`
      );
      return response.data.count; // Assuming the API returns { count: <number> }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch enrollment count."
      );
    }
  }
);

// ============================================================================
// 📚 BATCH COURSE ASYNC THUNKS
// ============================================================================

// Create a new batch course
export const createBatchCourse = createAsyncThunk(
  "batchCourses/createBatchCourse",
  async (batchCourseData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/batch-courses/create", batchCourseData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create batch course"
      );
    }
  }
);

// Fetch all batch courses
export const fetchBatchCourses = createAsyncThunk(
  "batchCourses/fetchBatchCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/batch-courses");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch batch courses"
      );
    }
  }
);

// Fetch batch course by ID
export const fetchBatchCourseById = createAsyncThunk(
  "batchCourses/fetchBatchCourseById",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/batch-courses/${courseId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch batch course details"
      );
    }
  }
);

// Add user to batch course
export const addUserToBatch = createAsyncThunk(
  "batchCourses/addUserToBatch",
  async ({ courseId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/batch-courses/${courseId}/add-user`, { userId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add user to batch course"
      );
    }
  }
);

// Remove user from batch course
export const removeUserFromBatch = createAsyncThunk(
  "batchCourses/removeUserFromBatch",
  async ({ courseId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/batch-courses/${courseId}/remove-user/${userId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove user from batch course"
      );
    }
  }
);

// Course slice
const courseSlice = createSlice({
  name: "courses",
  initialState: {
    courses: [],
    course: null,
    subjects: [],
    selectedSubject: null,
    chapters: [],
    chapter: null,
    categories: [],
    category: null,
    loading: false,
    error: null,
    enrollmentCount: null, // New state to store the enrollment count
    // Batch course state
    batchCourses: [],
    selectedBatchCourse: null,
  },
  reducers: {
    clearCourse: (state) => {
      state.course = null;
    },
    clearCategory: (state) => {
      state.category = null;
    },
    clearEnrollmentCount: (state) => {
      state.enrollmentCount = null; // Clear enrollment count when necessary
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch a single course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.course = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create a new course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.push(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update an existing course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload;
        
        // Update course in the courses list
        const index = state.courses.findIndex(
          (course) => course._id === updatedCourse._id || course._id?.toString() === updatedCourse._id?.toString()
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
        
        // 🔥 CRITICAL: Also update the single course state if it matches
        // This ensures the UI reflects the update immediately
        if (state.course && (
          state.course._id === updatedCourse._id || 
          state.course._id?.toString() === updatedCourse._id?.toString()
        )) {
          state.course = updatedCourse;
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete a course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter(
          (course) => course._id !== action.payload
        );
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch categories by course ID
      .addCase(fetchCategoriesByCourseId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesByCourseId.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategoriesByCourseId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch all categories
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create a new category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update an existing category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(
          (category) => category._id === action.payload._id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete a category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(
          (category) => category._id !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    // Create Subject
    builder.addCase(createSubject.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createSubject.fulfilled, (state, action) => {
      state.loading = false;
      if (Array.isArray(state.subjects)) {
        state.subjects.push(action.payload);
      } else {
        state.subjects = [action.payload]; // Fallback if subjects was not an array
      }
    });
    builder.addCase(createSubject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    });

    // Get All Subjects
    builder.addCase(getAllSubjects.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllSubjects.fulfilled, (state, action) => {
      state.loading = false;
      state.subjects = action.payload;
    });
    builder.addCase(getAllSubjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    });

    // Get Subject by ID
    builder.addCase(getSubjectById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getSubjectById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedSubject = action.payload;
    });
    builder.addCase(getSubjectById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    });

    // Update Subject by ID
    builder.addCase(updateSubjectById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateSubjectById.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.subjects.findIndex(
        (subject) => subject._id === action.payload.data._id
      );
      if (index !== -1) {
        state.subjects[index] = action.payload.data;
      }
    });
    builder.addCase(updateSubjectById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    });

    // Delete Subject by ID
    builder.addCase(deleteSubjectById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteSubjectById.fulfilled, (state, action) => {
      state.loading = false;
      state.subjects = state.subjects.filter(
        (subject) => subject._id !== action.meta.arg
      );
    });
    builder.addCase(deleteSubjectById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    });
    // Create Chapter
    builder.addCase(createChapter.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createChapter.fulfilled, (state, action) => {
      state.isLoading = false;
      if (Array.isArray(state.chapters)) {
        state.chapters.push(action.payload);
      } else {
        state.chapters = [action.payload]; // Fallback if subjects was not an array
      }
    });
    builder.addCase(createChapter.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Get All Chapters
    builder.addCase(getAllChapters.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getAllChapters.fulfilled, (state, action) => {
      state.isLoading = false;
      state.chapters = action.payload; // Populate chapters array
    });
    builder.addCase(getAllChapters.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Get Chapter by ID
    builder.addCase(getChapterById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getChapterById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.chapter = action.payload; // Set specific chapter
    });
    builder.addCase(getChapterById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Update Chapter by ID
    builder.addCase(updateChapterById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateChapterById.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.chapters.findIndex(
        (chapter) => chapter._id === action.payload._id
      );
      if (index !== -1) {
        state.chapters[index] = action.payload; // Update the chapter in the list
      }
    });
    builder.addCase(updateChapterById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Delete Chapter by ID
    builder.addCase(deleteChapterById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteChapterById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.chapters = state.chapters.filter(
        (chapter) => chapter._id !== action.meta.arg // Remove deleted chapter from list
      );
    });
    builder
      .addCase(deleteChapterById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add case for updating course status
      .addCase(updateCourseStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourseStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courses.findIndex(
          (course) => course._id === action.payload._id
        );
        if (index !== -1) {
          state.courses[index] = action.payload; // Update the course in the list
        }
      })
      .addCase(updateCourseStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Course Publish Status
      .addCase(togglePublishCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePublishCourse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courses.findIndex(
          (course) => course._id === action.payload.courseId
        );
        if (index !== -1) {
          state.courses[index].isPublished = action.payload.isPublished;
        }
      })
      .addCase(togglePublishCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Enrollment Count
      .addCase(fetchEnrollmentCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentCount.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollmentCount = action.payload; // Set the enrollment count
      })
      .addCase(fetchEnrollmentCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Handle errors
      })
      // ============================================================================
      // 📚 BATCH COURSE REDUCERS
      // ============================================================================
      // Create Batch Course
      .addCase(createBatchCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBatchCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.batchCourses.push(action.payload);
      })
      .addCase(createBatchCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Batch Courses
      .addCase(fetchBatchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.batchCourses = action.payload;
      })
      .addCase(fetchBatchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Batch Course By ID
      .addCase(fetchBatchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBatchCourse = action.payload;
      })
      .addCase(fetchBatchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add User to Batch
      .addCase(addUserToBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUserToBatch.fulfilled, (state, action) => {
        state.loading = false;
        // Update the batch course in the list
        const index = state.batchCourses.findIndex(
          (course) => course._id === action.payload._id
        );
        if (index !== -1) {
          state.batchCourses[index] = action.payload;
        }
        // Update selected batch course if it matches
        if (state.selectedBatchCourse && state.selectedBatchCourse._id === action.payload._id) {
          state.selectedBatchCourse = action.payload;
        }
      })
      .addCase(addUserToBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove User from Batch
      .addCase(removeUserFromBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeUserFromBatch.fulfilled, (state, action) => {
        state.loading = false;
        // Update the batch course in the list
        const index = state.batchCourses.findIndex(
          (course) => course._id === action.payload._id
        );
        if (index !== -1) {
          state.batchCourses[index] = action.payload;
        }
        // Update selected batch course if it matches
        if (state.selectedBatchCourse && state.selectedBatchCourse._id === action.payload._id) {
          state.selectedBatchCourse = action.payload;
        }
      })
      .addCase(removeUserFromBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCourse, clearCategory } = courseSlice.actions;

export default courseSlice.reducer;

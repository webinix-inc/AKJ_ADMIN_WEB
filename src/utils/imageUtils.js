// Utility functions for handling course images in admin

// Normalize API base URL to avoid duplicated slashes when composing paths
const RAW_API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8890";
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

/**
 * Get the streaming URL for a course image
 * @param {string} courseId - The course ID
 * @returns {string} - The streaming URL for the course image
 */
export const getCourseImageUrl = (courseId) => {
  if (!courseId) return null;
  return `${API_BASE_URL}/api/v1/stream/course-image/${courseId}`;
};

/**
 * Get the streaming URL for any S3 image
 * @param {string} s3Key - The S3 key or filename
 * @param {string} folder - The S3 folder (default: 'images')
 * @returns {string} - The streaming URL for the image
 */
export const getS3ImageUrl = (s3Key, folder = 'images') => {
  if (!s3Key) return null;
  
  console.log('🔧 getS3ImageUrl Debug:', { s3Key, folder });
  
  // 🔧 FIX: Use folder parameter approach which actually works with backend
  // If it's already a full URL, extract the key and split into filename + folder
  if (s3Key.includes('amazonaws.com/')) {
    const key = s3Key.split('amazonaws.com/')[1];
    const keyParts = key.split('/');
    const filename = keyParts.pop(); // Get the last part (filename)
    const folderPath = keyParts.join('/'); // Get the folder path
    const streamingUrl = `${API_BASE_URL}/api/v1/stream/image/${encodeURIComponent(filename)}?folder=${encodeURIComponent(folderPath)}`;
    console.log('🔧 Full S3 URL conversion:', { key, filename, folderPath, streamingUrl });
    return streamingUrl;
  }
  
  // If it's just a key/filename, construct with folder
  const streamingUrl = `${API_BASE_URL}/api/v1/stream/image/${encodeURIComponent(s3Key)}?folder=${encodeURIComponent(folder)}`;
  console.log('🔧 Simple key conversion:', { s3Key, folder, streamingUrl });
  return streamingUrl;
};

/**
 * Get a fallback image URL
 * @returns {string} - Default fallback image URL
 */
export const getFallbackImageUrl = () => {
  // Use a data URL for a simple placeholder or return null to use the imported img
  return null; // Let the component handle fallback with imported img
};

/**
 * Handle image load errors - SIMPLIFIED
 * @param {Event} event - The error event
 */
export const handleImageError = (event) => {
  // Simple fallback - just use a placeholder or let component handle it
  event.target.onerror = null; // Prevent infinite loop
};

/**
 * Get optimized course image - SIMPLIFIED
 * @param {Object} course - The course object
 * @returns {string} - The image URL or null for fallback
 */
export const getOptimizedCourseImage = (course) => {
  if (!course) {
    return null; // Let component use default image
  }
  
  // Handle courseImage as array or single value
  const imageUrl = Array.isArray(course.courseImage) 
    ? course.courseImage[0] 
    : course.courseImage;
  
  if (!imageUrl || (typeof imageUrl === 'string' && imageUrl.trim() === '')) {
    return null; // Let component use default image
  }
  
  // If it's already a full URL (S3 URL), convert to streaming URL
  if (typeof imageUrl === 'string' && imageUrl.includes('amazonaws.com/')) {
    return getS3ImageUrl(imageUrl);
  }
  
  // If it's just a key, use it with the default folder
  if (typeof imageUrl === 'string') {
    return getS3ImageUrl(imageUrl, 'images/course');
  }
  
  return null; // Fallback
};

/**
 * Get the streaming URL for a banner image
 * @param {string} bannerId - The banner ID
 * @returns {string} - The streaming URL for the banner image
 */
export const getBannerImageUrl = (bannerId) => {
  if (!bannerId) return null;
  return `${API_BASE_URL}/api/v1/stream/banner-image/${bannerId}`;
};

/**
 * Get the streaming URL for a book image
 * @param {string} bookId - The book ID
 * @returns {string} - The streaming URL for the book image
 */
export const getBookImageUrl = (bookId) => {
  if (!bookId) return null;
  return `${API_BASE_URL}/api/v1/stream/book-image/${bookId}`;
};

/**
 * Get optimized book image with fallback handling
 * @param {Object} book - The book object
 * @returns {string} - The optimized image URL
 */
export const getOptimizedBookImage = (book) => {
  if (!book) return getFallbackImageUrl();
  
  // If book has an ID, use the streaming endpoint
  if (book._id) {
    return getBookImageUrl(book._id);
  }
  
  // If book has imageUrl field, try to use it via S3 streaming
  if (book.imageUrl) {
    return getS3ImageUrl(book.imageUrl);
  }
  
  // Fallback to default image
  return getFallbackImageUrl();
};

/**
 * Get optimized quiz image URL - CONVERT TO STREAMING URL
 * @param {string} imageUrl - The S3 image URL or key (can be presigned URL or S3 URL)
 * @returns {string} - The optimized streaming URL or presigned URL
 */
export const getOptimizedQuizImage = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If it's already a presigned URL (contains X-Amz-Signature), return as-is
  if (imageUrl.includes('X-Amz-Signature') || imageUrl.includes('X-Amz-Algorithm')) {
    return imageUrl;
  }
  
  // If it's a full S3 URL, extract the key and determine folder
  if (imageUrl.includes('amazonaws.com/')) {
    const key = imageUrl.split('amazonaws.com/')[1];
    // Check if it's the new test path structure: test/{folderName}/{testName}/{imageName}
    if (key.startsWith('test/')) {
      const keyParts = key.split('/');
      const filename = keyParts.pop(); // Get the last part (filename)
      const folderPath = keyParts.join('/'); // Get the folder path (test/{folderName}/{testName})
      return `${API_BASE_URL}/api/v1/stream/image/${encodeURIComponent(filename)}?folder=${encodeURIComponent(folderPath)}`;
    }
    // Fallback to old quiz-images structure
    return getS3ImageUrl(imageUrl, 'quiz-images');
  }
  
  // If it's just a key, try to determine the folder
  if (imageUrl.startsWith('test/')) {
    const keyParts = imageUrl.split('/');
    const filename = keyParts.pop();
    const folderPath = keyParts.join('/');
    return `${API_BASE_URL}/api/v1/stream/image/${encodeURIComponent(filename)}?folder=${encodeURIComponent(folderPath)}`;
  }
  
  // Default fallback
  return getS3ImageUrl(imageUrl, 'quiz-images');
};
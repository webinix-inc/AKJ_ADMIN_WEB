import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8890/api/v1";

// Create an instance of axios with a base URL
const api = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds timeout to prevent hanging requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add Authorization header with the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle token expiration or invalid token
api.interceptors.response.use(
  (response) => {
    // If the response is successful, just return the response
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Automatically log the user out
      localStorage.removeItem("accessToken");
      window.location.href = "/";

      // Optionally: Display a message that the session has expired
      alert("Session has expired. Please log in again.");
    }

    return Promise.reject(error); // Continue rejecting the error
  }
);

// Optionally add a function to set the Authorization token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;

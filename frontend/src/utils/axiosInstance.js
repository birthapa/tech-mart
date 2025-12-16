import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // e.g., http://localhost:9000
  withCredentials: true, // Important if using cookies; otherwise false
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken"); // From your authSlice
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor for 401 (auto logout)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      window.location.href = "/login"; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
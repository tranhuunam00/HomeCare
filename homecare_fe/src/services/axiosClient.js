// src/utils/axiosClient.js
import axios from "axios";
import STORAGE from "./storage";

const apiEndPoint = `${
  import.meta.env.VITE_API_ENDPOINT || "https://default-url.com"
}/api`;

console.log("apiEndPoint ", apiEndPoint);

const axiosInstance = axios.create({
  baseURL: apiEndPoint,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor (đính token nếu có)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor (xử lý refresh token tự động)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;

    if (
      error?.response?.status === 401 &&
      !originalConfig._retry &&
      originalConfig.url !== "/users/login"
    ) {
      originalConfig._retry = true;
      try {
        const rs = await axiosInstance.post("/users/refresh-token", {
          refreshToken: localStorage.getItem("REFRESH_TOKEN"),
          token: localStorage.getItem("TOKEN"),
          userId: JSON.parse(localStorage.getItem("USER") || "{}")._id,
        });

        if (rs.status === 200) {
          const { token, refreshToken } = rs.data.data;
          localStorage.setItem("TOKEN", token);
          localStorage.setItem("REFRESH_TOKEN", refreshToken);
          originalConfig.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalConfig);
        }
      } catch (refreshError) {
        STORAGE.clearAuth(); // ✅ Xóa hết token, user, doctor,...
        window.location.reload(); // ✅ Reload lại app
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Method wrappers
const get = (url, config = {}) => axiosInstance.get(url, config);
const post = (url, data, config = {}) => axiosInstance.post(url, data, config);
const put = (url, data, config = {}) => axiosInstance.put(url, data, config);
const del = (url, data, config = {}) =>
  axiosInstance.delete(url, { data, ...config });
const postForm = (url, data, config = {}) =>
  axiosInstance.post(url, data, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
const putForm = (url, data, config = {}) =>
  axiosInstance.put(url, data, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
const API_CALL = {
  get,
  post,
  put,
  del,
  postForm,
  putForm,
};

export default API_CALL;

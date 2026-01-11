// src/utils/axiosClient.js
import axios from "axios";
import STORAGE from "./storage";
import { toast } from "react-toastify";

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
      originalConfig.url !== "/auth/login" &&
      !originalConfig.url.includes("/users/refresh-token")
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
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const withErrorToast =
  (fn, defaultMsg) =>
  async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      toast.error(err?.response?.data?.message || defaultMsg);
      throw err;
    }
  };

// ✅ Method wrappers
const get = withErrorToast(
  (url, config) => axiosInstance.get(url, config),
  "Lỗi khi GET dữ liệu"
);
const post = withErrorToast(
  (url, data, config) => axiosInstance.post(url, data, config),
  "Lỗi khi POST dữ liệu"
);
const put = withErrorToast(
  (url, data, config) => axiosInstance.put(url, data, config),
  "Lỗi khi PUT dữ liệu"
);
const del = withErrorToast(
  (url, data, config) => axiosInstance.delete(url, { data, ...config }),
  "Lỗi khi DELETE dữ liệu"
);

const postForm = withErrorToast(
  (url, data, config) =>
    axiosInstance.post(url, data, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    }),
  "Lỗi khi upload form"
);

const patchForm = withErrorToast(
  (url, data, config) =>
    axiosInstance.patch(url, data, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    }),
  "Lỗi khi upload form"
);

const putForm = withErrorToast(
  (url, data, config) =>
    axiosInstance.put(url, data, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    }),
  "Lỗi khi update form"
);

const patch = withErrorToast(
  (url, data, config) => axiosInstance.patch(url, data, config),
  "Lỗi khi PATCH dữ liệu"
);

const API_CALL = {
  get,
  post,
  put,
  del,
  patch,
  postForm,
  putForm,
  patchForm,
};

export default API_CALL;

import axios from "axios";
import { authUtils } from "../utils/authUtils"; // File tiện ích bạn đã định nghĩa ở bước trước

const apiClient = axios.create({
  // Thay đổi port 7198 bằng port thực tế của API ASP.NET Core đang chạy
  baseURL: "http://localhost:5242",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Trước khi gửi request đi, tự động lấy Token gắn vào Header
apiClient.interceptors.request.use(
  (config) => {
    const token = authUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;

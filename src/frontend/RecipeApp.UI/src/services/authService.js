import apiClient from "./apiClient";
import { authUtils } from "../utils/authUtils";

export const authService = {
  login: async (email, password) => {
    // 1. Lấy token
    const loginRes = await apiClient.post("/api/features/auth/login", {
      email,
      password,
    });
    const { token } = loginRes.data;

    localStorage.setItem("recipe_app_token", token);

    const profileRes = await apiClient.get("/api/features/users/me");
    const userInfo = profileRes.data;

    authUtils.setAuthData(token, userInfo);

    return userInfo;
  },

  logout: () => {
    authUtils.clearAuthData();
  },

  register: async (email, password, displayName) => {
    try {
      // 1. Gọi API đăng ký để tạo tài khoản và lấy Token
      const response = await apiClient.post("/api/features/auth/register", {
        email,
        password,
        displayName,
      });

      const { token, message } = response.data;

      // 2. BẮT BUỘC: Lưu tạm token vào localStorage.
      // Việc này giúp apiClient.interceptors (đã setup ở file apiClient.js)
      // có thể lấy được token gắn vào Header cho API call tiếp theo.
      localStorage.setItem("recipe_app_token", token);

      // 3. Gọi API /me để lấy toàn bộ thông tin user (Avatar, Follower, Bio...) từ DB
      const profileRes = await apiClient.get("/api/features/users/me");
      const userInfo = profileRes.data;

      // 4. Lưu chính thức cả Token và UserInfo vào localStorage thông qua authUtils
      authUtils.setAuthData(token, userInfo);

      return { success: true, message, userInfo };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Đăng ký thất bại. Vui lòng thử lại sau.";
      throw new Error(errorMessage);
    }
  },
};

import apiClient from "./apiClient";
import { authUtils } from "../utils/authUtils";

export const authService = {
  login: async (email, password) => {
    try {
      // 1. Gọi API tới backend
      const response = await apiClient.post("/api/features/auth/login", {
        email,
        password,
      });

      // Backend ASP.NET Core của bạn trả về { token, message }
      const { token, message } = response.data;

      // 2. Tạm thời bóc tách thông tin cơ bản từ email để lưu (Nếu có API /me thì gọi thêm ở đây)
      const userInfo = { email: email };

      // 3. Lưu Token và UserInfo vào LocalStorage
      authUtils.setAuthData(token, userInfo);

      return { success: true, message };
    } catch (error) {
      // Bắt lỗi từ backend trả về (ví dụ: HTTP 401 Unauthorized)
      const errorMessage =
        error.response?.data?.message ||
        "Lỗi kết nối máy chủ. Vui lòng thử lại sau.";
      throw new Error(errorMessage);
    }
  },

  logout: () => {
    authUtils.clearAuthData();
  },
};

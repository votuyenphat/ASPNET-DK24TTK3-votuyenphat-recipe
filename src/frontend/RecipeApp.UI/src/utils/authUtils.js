const TOKEN_KEY = "recipe_app_token";
const USER_INFO_KEY = "recipe_app_user";

export const authUtils = {
  // Lưu dữ liệu sau khi login thành công
  setAuthData: (token, userInfo) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  },

  // Lấy Token để gắn vào Header API
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Lấy thông tin User để hiển thị lên UI (Avatar, Tên...)
  getUserInfo: () => {
    const user = localStorage.getItem(USER_INFO_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Đăng xuất
  clearAuthData: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
  },

  // Kiểm tra xem đã login chưa
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  isLoggedIn: () => {
    const token = localStorage.getItem("token");
    return !!token; // Ép kiểu về boolean (true nếu có token, false nếu null)
  },

  getUserInfo: () => {
    const userStr = localStorage.getItem("recipe_app_user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr); // Parse chuỗi JSON thành Object
    } catch (error) {
      console.error("Lỗi parse thông tin user:", error);
      return null;
    }
  },

  isLoggedIn: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // HÀM KIỂM TRA NHANH XEM CÓ PHẢI ADMIN KHÔNG
  isAdmin: () => {
    const user = authUtils.getUserInfo();
    return user?.role === "Admin"; // Kiểm tra quyền admin
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    window.location.href = "/";
  },
};

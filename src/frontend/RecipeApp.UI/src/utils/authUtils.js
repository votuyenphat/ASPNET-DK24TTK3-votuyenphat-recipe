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
};

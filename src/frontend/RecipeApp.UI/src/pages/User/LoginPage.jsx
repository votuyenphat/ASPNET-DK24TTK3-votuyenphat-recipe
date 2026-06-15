import React from "react";
import { LoginForm } from "../../components/organisms/LoginForm/LoginForm";
import "./LoginPage.css";

export const LoginPage = () => {
  return (
    <div className="login-layout">
      {/* Cột trái: Hình ảnh truyền cảm hứng (Chỉ hiện trên Desktop) */}
      <div className="login-banner">
        <div className="banner-overlay">
          <h1 className="banner-title">Nấu ăn là để chia sẻ</h1>
          <p className="banner-subtitle">
            Khám phá hàng ngàn công thức và lưu giữ hương vị gia đình cùng cộng
            đồng của chúng tôi.
          </p>
        </div>
        {/* Bạn có thể thay src bằng link ảnh đồ ăn thực tế */}
        <img
          className="banner-image"
          src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
          alt="Food Banner"
        />
      </div>

      {/* Cột phải: Khu vực Form */}
      <div className="login-form-section">
        <div className="login-form-wrapper">
          <div className="brand-logo">
            {/* Tạm dùng text, sau này bạn thay bằng thẻ <img> logo nhé */}
            <span>🍳</span> RecipeApp
          </div>
          <LoginForm />

          <div className="login-footer">
            <p>
              Chưa có tài khoản?{" "}
              <a href="/register" className="link-primary">
                Đăng ký ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

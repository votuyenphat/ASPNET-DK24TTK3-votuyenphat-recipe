import React from "react";
import "./LoginPage.css"; // Tái sử dụng CSS layout chia đôi màn hình
import { RegisterForm } from "../../components/organisms/RegisterForm/RegisterForm";

export const RegisterPage = () => {
  return (
    <div className="login-layout">
      {/* Khối Form bên trái (Đảo vị trí so với LoginPage) */}
      <section className="login-form-section">
        <div className="login-form-wrapper">
          <div className="brand-logo">
            <span role="img" aria-label="chef">
              🍳
            </span>{" "}
            RecipeApp
          </div>

          <RegisterForm />

          <div className="login-footer">
            <p>
              Đã có tài khoản?{" "}
              <a href="/login" className="link-primary">
                Đăng nhập ngay
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Khối Banner bên phải */}
      <section className="login-banner">
        <div className="banner-overlay">
          <h1 className="banner-title">
            Lưu giữ hương vị
            <br />
            của riêng bạn
          </h1>
          <p className="banner-subtitle">
            Chia sẻ công thức, kết nối đam mê và tạo ra những cuốn sổ tay ẩm
            thực tuyệt vời.
          </p>
        </div>
        {/* Đổi một tấm ảnh khác mang tính chất chuẩn bị nguyên liệu (đăng ký) */}
        <img
          className="banner-image"
          src="https://images.unsplash.com/photo-1466637574441-749b8f19452f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Chuẩn bị nguyên liệu nấu ăn"
        />
      </section>
    </div>
  );
};

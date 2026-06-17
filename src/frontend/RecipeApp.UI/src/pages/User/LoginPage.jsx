import React from "react";
import { LoginForm } from "../../components/organisms/LoginForm/LoginForm";
import "./LoginPage.css";

export const LoginPage = () => {
  return (
    <div className="login-layout">
      {/* Khối Banner bên trái */}
      <section className="login-banner">
        <div className="banner-overlay">
          <h1 className="banner-title">
            Nâng tầm
            <br />
            Bữa cơm gia đình
          </h1>
          <p className="banner-subtitle">
            Hơn 10.000 công thức nấu ăn từ cộng đồng đang chờ bạn khám phá mỗi
            ngày.
          </p>
        </div>
        <img
          className="banner-image"
          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Người nội trợ đang nấu ăn"
        />
      </section>

      {/* Khối Form bên phải */}
      <section className="login-form-section">
        <div className="login-form-wrapper">
          <div className="brand-logo">
            <span role="img" aria-label="chef">
              🍳
            </span>{" "}
            RecipeApp
          </div>

          <LoginForm />

          <div className="login-footer">
            <p>
              Chưa có tài khoản?{" "}
              <a href="/register" className="link-primary">
                Đăng ký miễn phí
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

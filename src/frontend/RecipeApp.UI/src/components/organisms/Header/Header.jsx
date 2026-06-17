import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { authUtils } from "../../../utils/authUtils";
import "./Header.css";

export const Header = () => {
  const navigate = useNavigate();
  const userInfo = authUtils.getUserInfo();

  const handleLogout = () => {
    authUtils.clearAuthData();
    navigate("/login");
  };

  return (
    <header className="main-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <span role="img" aria-label="chef">
            🍳
          </span>{" "}
          RecipeApp
        </Link>

        {/* Search Bar (Molecule - Viết gộp tạm ở đây, sau này tách ra file riêng) */}
        <div className="header-search">
          <input
            type="text"
            placeholder="Tìm kiếm công thức, nguyên liệu..."
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>

        {/* User Actions */}
        <div className="header-actions">
          <Link to="/write" className="btn-write-recipe">
            + Viết công thức
          </Link>

          {userInfo ? (
            <div className="user-menu">
              <img
                src={userInfo.avatarUrl || "https://via.placeholder.com/40"}
                alt="Avatar"
                className="user-avatar"
              />
              <span className="user-name">{userInfo.displayName || "An"}</span>
              <button onClick={handleLogout} className="btn-logout">
                Thoát
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-login-outline">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

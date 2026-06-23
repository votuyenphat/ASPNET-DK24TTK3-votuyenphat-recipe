import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChefHat, Search, LogOut } from "lucide-react";
import { authUtils } from "../../../utils/authUtils";
import "./Header.css";
import { HeaderSearch } from "../HeaderSearch/HeaderSearch";

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
          <ChefHat size={28} color="var(--color-primary)" /> RecipeApp
        </Link>

        {/* Search Bar (Molecule - Viết gộp tạm ở đây, sau này tách ra file riêng) */}
        <div className="header-search">
          <HeaderSearch />
        </div>

        {/* User Actions */}
        <div className="header-actions">
          <Link to="/recipe-writer" className="btn-write-recipe">
            + Viết công thức
          </Link>

          {userInfo ? (
            <div className="user-menu">
              <Link to="/profile">
                <img
                  src={userInfo.avatarUrl || "https://via.placeholder.com/40"}
                  alt="Avatar"
                  className="user-avatar"
                />
              </Link>
              <span className="user-name">{userInfo.displayName || "An"}</span>
              <button onClick={handleLogout} className="btn-logout">
                <LogOut size={20} />
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

import React from "react";
import { NavLink } from "react-router-dom";
import "./MobileBottomNav.css";

export const MobileBottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Khám phá</span>
      </NavLink>

      <NavLink
        to="/search"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <span className="nav-icon">🔍</span>
        <span className="nav-label">Tìm kiếm</span>
      </NavLink>

      <NavLink to="/write" className="nav-item nav-item-primary">
        <div className="primary-btn-wrapper">
          <span className="nav-icon">✍️</span>
        </div>
        <span className="nav-label">Viết</span>
      </NavLink>

      <NavLink
        to="/saved"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <span className="nav-icon">❤️</span>
        <span className="nav-label">Đã lưu</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <span className="nav-icon">👤</span>
        <span className="nav-label">Hồ sơ</span>
      </NavLink>
    </nav>
  );
};

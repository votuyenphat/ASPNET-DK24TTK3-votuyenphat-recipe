import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, User, LogOut, Settings } from "lucide-react";
import { authUtils } from "../../../utils/authUtils";
import "./Navbar.css";

export const Navbar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isLoggedIn = authUtils.isLoggedIn();
  const isAdmin = authUtils.isAdmin(); // Kiểm tra quyền admin thời gian thực
  const currentUser = authUtils.getUserInfo();

  return (
    <nav className="navbar-wrapper">
      {/* ... Các phần Logo, Menu Khám phá, Ô Search giữ nguyên ... */}

      <div className="navbar-actions">
        {isLoggedIn ? (
          <div className="user-profile-dropdown-wrapper">
            <img
              src={
                currentUser?.avatarUrl ||
                "https://ui-avatars.com/api/?name=Admin"
              }
              alt="avatar"
              className="nav-avatar-img"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />

            {isDropdownOpen && (
              <div className="nav-dropdown-menu animation-scale-up">
                <div className="dropdown-user-info">
                  <h4>{currentUser?.displayName}</h4>
                  <span className="user-role-badge">{currentUser?.role}</span>
                </div>

                <hr className="dropdown-divider" />

                {/* =======================================================
                    LỐI TẮT THẦN THÁNH: CHỈ HIỂN THỊ NẾU USER LÀ ADMIN
                    ======================================================= */}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="dropdown-item admin-link"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <ShieldAlert size={16} />
                    <span>Quản trị hệ thống</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User size={16} /> Đằng sau gian bếp
                </Link>

                <button
                  className="dropdown-item logout-btn"
                  onClick={() => authUtils.logout()}
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn-login" onClick={() => navigate("/login")}>
            Đăng nhập
          </button>
        )}
      </div>
    </nav>
  );
};

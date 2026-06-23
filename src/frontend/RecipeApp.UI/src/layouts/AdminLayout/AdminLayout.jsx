import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  Tags,
  ChefHat,
  Sparkles,
  Grid3X3,
  LogOut,
  ArrowLeftRight,
  Menu,
  X,
  Megaphone,
} from "lucide-react";
import "./AdminLayout.css";
import { authUtils } from "../../utils/authUtils";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const currentUser = authUtils.getUserInfo();

  const handleLogout = () => {
    authUtils.logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout-container">
      {/* 1. THANH SIDEBAR ĐIỀU HƯỚNG CỐ ĐỊNH */}
      <aside
        className={`admin-sidebar ${isSidebarOpen ? "open" : "collapsed"}`}
      >
        <div className="sidebar-brand">
          <ChefHat size={28} color="var(--color-primary)" />
          {isSidebarOpen && (
            <span className="brand-text">
              Bếp Trưởng <span className="admin-tag">CMS</span>
            </span>
          )}
        </div>

        <nav className="sidebar-menu">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <LayoutDashboard size={20} />
            {isSidebarOpen && <span>Bảng theo dõi</span>}
          </NavLink>

          <NavLink
            to="/admin/recipes"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <ChefHat size={20} />
            {isSidebarOpen && <span>Quản lý công thức</span>}
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <Folder size={20} />
            {isSidebarOpen && <span>Quản lý danh mục</span>}
          </NavLink>

          <NavLink
            to="/admin/tags"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <Tags size={20} />
            {isSidebarOpen && <span>Quản lý thẻ (Tags)</span>}
          </NavLink>

          <NavLink
            to="/admin/sponsors"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <Sparkles size={20} />
            {isSidebarOpen && <span>Chiến dịch tài trợ</span>}
          </NavLink>

          <NavLink
            to="/admin/bento-config"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <Grid3X3 size={20} />
            {isSidebarOpen && <span>Cấu hình BentoGrid</span>}
          </NavLink>

          <NavLink
            to="/admin/challenges"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <Megaphone size={20} />
            {isSidebarOpen && <span>Quản lý sự kiện</span>}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="menu-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* 2. KHU VỰC NỘI DUNG CHÍNH (MAIN CONTENT AREA) */}
      <div className="admin-main-viewport">
        {/* TOPBAR ĐIỀU KHIỂN */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="btn-toggle-sidebar"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="topbar-page-title">Hệ thống quản trị</h2>
          </div>

          <div className="topbar-right">
            {/* LỐI TẮT QUAY LẠI TRANG USER NHANH CHÓNG */}
            <button className="btn-switch-view" onClick={() => navigate("/")}>
              <ArrowLeftRight size={16} />
              <span>Xem trang chính</span>
            </button>

            <div className="admin-profile-badge">
              <img
                src={
                  currentUser?.avatarUrl ||
                  "https://ui-avatars.com/api/?name=Admin"
                }
                alt="Admin Avatar"
              />
              <div className="admin-meta">
                <span className="admin-name">
                  {currentUser?.displayName || "Quản trị viên"}
                </span>
                <span className="admin-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* NƠI RENDER CÁC TRANG ZONING DƯỚI DẠNG ROUTE CON */}
        <main className="admin-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

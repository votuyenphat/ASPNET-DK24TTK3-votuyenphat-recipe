import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserLayout } from "../layouts/UserLayout/UserLayout";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import { LoginPage } from "../pages/User/LoginPage";

// Mock pages
const HomePage = () => <div>Trang chủ Cookpad</div>;
const AdminDashboard = () => <div>Dashboard Quản trị</div>;

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Nhóm Route dành cho User */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recipe/:id" element={<div>Chi tiết công thức</div>} />
        </Route>

        {/* Nhóm Route dành cho Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<div>Quản lý người dùng</div>} />
        </Route>

        {/* Bắt lỗi 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

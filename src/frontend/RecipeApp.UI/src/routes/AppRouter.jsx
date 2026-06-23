import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserLayout } from "../layouts/UserLayout/UserLayout";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import { LoginPage } from "../pages/User/LoginPage";
import { RegisterPage } from "../pages/User/RegisterPage";
import { HomePage } from "../pages/User/HomePage";
import { RecipeDetailPage } from "../pages/User/RecipeDetailPage";
import { WriteRecipePage } from "../pages/User/WriteRecipePage";
import { ProfilePage } from "../pages/User/ProfilePage";
import { EditRecipePage } from "../pages/User/EditRecipePage";
import { EditProfilePage } from "../pages/User/EditProfilePage";

// Mock pages
const AdminDashboard = () => <div>Dashboard Quản trị</div>;

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Nhóm Route dành cho User */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipe/:slug" element={<RecipeDetailPage />} />
          <Route path="/recipe-writer" element={<WriteRecipePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/edit-recipe/:slug" element={<EditRecipePage />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
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

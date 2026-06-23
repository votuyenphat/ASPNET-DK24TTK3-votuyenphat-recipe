import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserLayout } from "../layouts/UserLayout/UserLayout";
import { LoginPage } from "../pages/User/LoginPage";
import { RegisterPage } from "../pages/User/RegisterPage";
import { HomePage } from "../pages/User/HomePage";
import { RecipeDetailPage } from "../pages/User/RecipeDetailPage";
import { WriteRecipePage } from "../pages/User/WriteRecipePage";
import { ProfilePage } from "../pages/User/ProfilePage";
import { EditRecipePage } from "../pages/User/EditRecipePage";
import { EditProfilePage } from "../pages/User/EditProfilePage";
import { SearchPage } from "../pages/User/SearchPage";
import { PublicProfilePage } from "../pages/User/PublicProfilePage";
import { AdminRoute } from "../components/guards/AdminRoute";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import { AdminDashboard } from "../pages/Admin/AdminDashboard";
import { AdminCategoryManagement } from "../pages/Admin/AdminCategoryManagement";
import { AdminTagManagement } from "../pages/Admin/AdminTagManagement";
import { AdminRecipeManagement } from "../pages/Admin/AdminRecipeManagement";
import { AdminBentoConfig } from "../pages/Admin/AdminBentoConfig";
import { AdminSponsorManagement } from "../pages/Admin/AdminSponsorManagement";
import { ChallengePage } from "../pages/User/ChallengePage";
import { AdminChallengeManagement } from "../pages/Admin/AdminChallengeManagement";

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
          <Route path="/search" element={<SearchPage />} />
          <Route path="/chef/:userId" element={<PublicProfilePage />} />
          <Route path="/challenges" element={<ChallengePage />} />
        </Route>

        {/* Nhóm Route dành cho Admin */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategoryManagement />} />
            <Route path="tags" element={<AdminTagManagement />} />
            <Route path="recipes" element={<AdminRecipeManagement />} />
            <Route path="bento-config" element={<AdminBentoConfig />} />
            <Route path="sponsors" element={<AdminSponsorManagement />} />
            <Route path="challenges" element={<AdminChallengeManagement />} />
            {/* Các trang quản lý Category, Tags, Recipes của Admin sẽ viết ở đây */}
          </Route>
        </Route>

        {/* Bắt lỗi 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

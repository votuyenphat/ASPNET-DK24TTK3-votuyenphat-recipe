import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authUtils } from "../../utils/authUtils";

export const AdminRoute = () => {
  const isLoggedIn = authUtils.isLoggedIn();
  const isAdmin = authUtils.isAdmin();

  // Nếu chưa đăng nhập hoặc đăng nhập rồi nhưng KHÔNG PHẢI ADMIN -> Đá về trang chủ
  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Nếu chuẩn Admin -> Cho phép render các trang con nằm bên trong (Dashboard, Category...)
  return <Outlet />;
};

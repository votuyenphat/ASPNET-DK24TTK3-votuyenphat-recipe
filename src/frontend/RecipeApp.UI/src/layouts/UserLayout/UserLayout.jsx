import React from "react";
import { Outlet } from "react-router-dom";
import "./UserLayout.css";
import { Header } from "../../components/organisms/Header/Header";
import { MobileBottomNav } from "../../components/organisms/MobileBottomNav/MobileBottomNav";

export const UserLayout = () => {
  return (
    <div className="user-layout-wrapper">
      <Header />

      {/* Vùng chứa nội dung chính */}
      <main className="main-content">
        <Outlet />
      </main>

      <MobileBottomNav />

      {/* Có thể thêm Footer ở đây cho Desktop nếu cần */}
    </div>
  );
};

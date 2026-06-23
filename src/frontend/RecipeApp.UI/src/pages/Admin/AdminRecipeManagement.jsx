import React, { useState, useEffect } from "react";
import { Lock, Unlock, Eye, Heart } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";
import "./AdminCreative.css";

export const AdminRecipeManagement = () => {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Tái sử dụng API overview để lấy bài viết, thực tế nên gọi 1 API get all có phân trang
    apiClient.get("/api/admin/dashboard/overview").then((res) => {
      setRecipes(res.data.recentRecipes);
      setIsLoading(false);
    });
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus; // Đảo trạng thái
    try {
      await apiClient.put(`/api/admin/recipes/${id}/status`, {
        isDeleted: newStatus,
      });
      setRecipes(
        recipes.map((r) => (r.id === id ? { ...r, isDeleted: newStatus } : r)),
      );
      toast.success(newStatus ? "Đã khóa bài viết" : "Đã mở khóa bài viết");
    } catch (error) {
      toast.error("Lỗi thao tác!");
    }
  };

  return (
    <div className="admin-page-wrapper animation-fade-in">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Kiểm Duyệt Nội Dung</h1>
          <p className="admin-page-subtitle">
            Gạt công tắc để ẩn các bài viết vi phạm tiêu chuẩn cộng đồng
          </p>
        </div>
      </div>

      <div className="moderation-grid">
        {isLoading ? (
          <p>Đang tải...</p>
        ) : (
          recipes.map((recipe) => (
            <div
              key={recipe.id}
              className={`mod-card ${recipe.isDeleted ? "locked" : ""}`}
            >
              <div className="mod-card-header">
                <span className="mod-author">{recipe.authorName}</span>

                {/* NÚT GẠT ĐẲNG CẤP IOS */}
                <label className="ios-toggle">
                  <input
                    type="checkbox"
                    checked={!recipe.isDeleted} // Đang hiển thị = checked (Xanh)
                    onChange={() =>
                      handleToggleStatus(recipe.id, recipe.isDeleted)
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="mod-card-body">
                <h3 className="mod-title">{recipe.title}</h3>
                <div className="mod-stats">
                  <span>
                    <Heart size={14} /> {recipe.favoriteCount}
                  </span>
                  <span
                    className={`status-badge ${recipe.isDeleted ? "red" : "green"}`}
                  >
                    {recipe.isDeleted ? (
                      <>
                        <Lock size={12} /> Đã khóa
                      </>
                    ) : (
                      <>
                        <Unlock size={12} /> Hoạt động
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Trash2, Heart, Eye, TrendingUp } from "lucide-react";
import { authUtils } from "../../utils/authUtils";
import apiClient from "../../services/apiClient";
import "./ProfilePage.css";
import { ConfirmModal } from "../../components/molecules/ConfirmModal/ConfirmModal";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const userInfo = authUtils.getUserInfo();
  const [myRecipes, setMyRecipes] = useState([]);
  const [profileStats, setProfileStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null); // Lưu thông tin món ăn sắp xóa

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, recipesRes] = await Promise.all([
          apiClient.get("/api/features/users/me"),
          apiClient.get("/api/features/recipes/my-recipes"),
        ]);
        setProfileStats(profileRes.data);
        setMyRecipes(recipesRes.data);
      } catch (error) {
        toast.error("Lỗi tải dữ liệu cá nhân");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const openDeleteModal = (e, recipe) => {
    e.preventDefault();
    e.stopPropagation();

    setRecipeToDelete(recipe);
    setIsDeleteModalOpen(true);
  };

  // 2. KHI BẤM XÁC NHẬN TRONG MODAL: Mới gọi API Xóa
  const handleConfirmDelete = async () => {
    if (!recipeToDelete) return;

    setIsDeleteModalOpen(false); // Đóng modal ngay lập tức cho mượt
    const loadingToast = toast.loading("Đang xóa công thức...");

    try {
      await apiClient.delete(`/api/features/recipes/${recipeToDelete.id}`);

      setMyRecipes((prevRecipes) =>
        prevRecipes.filter((r) => r.id !== recipeToDelete.id),
      );
      setProfileStats((prev) => ({
        ...prev,
        totalRecipes: prev.totalRecipes - 1,
      }));

      toast.success("Đã xóa công thức thành công!", { id: loadingToast });
    } catch (error) {
      toast.error("Không thể xóa công thức lúc này.", { id: loadingToast });
    } finally {
      setRecipeToDelete(null); // Clear data
    }
  };

  if (isLoading)
    return <div className="profile-loading">Đang tải không gian bếp...</div>;
  const totalLikes = myRecipes.reduce(
    (sum, recipe) => sum + recipe.favoriteCount,
    0,
  );

  return (
    <div className="profile-container">
      <Toaster position="top-center" />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Xóa công thức?"
        message={`Bạn có chắc chắn muốn xóa "${recipeToDelete?.title}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa vĩnh viễn"
        cancelText="Giữ lại"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setRecipeToDelete(null);
        }}
      />

      {/* KHỐI THÔNG TIN VÀ THỐNG KÊ CHI TIẾT */}
      <div className="profile-header-card">
        <div className="profile-cover">
          <img
            src={
              profileStats?.coverUrl ||
              "https://images.unsplash.com/photo-1495195129352-aeb325a55b65?auto=format&fit=crop&w=1200"
            }
            alt="Cover"
          />
        </div>

        <div className="profile-info-section">
          <div className="profile-avatar-wrapper">
            <img
              src={
                profileStats?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${userInfo.displayName}`
              }
              alt="Avatar"
              className="profile-avatar-img"
            />
          </div>

          <div className="profile-details">
            <h1 className="profile-name">{profileStats?.displayName}</h1>
            <p className="profile-bio">
              {profileStats?.bio ||
                "Đầu bếp tại gia đam mê chia sẻ những hương vị ngọt ngào."}
            </p>

            <div className="profile-stats-grid">
              <div className="stat-box">
                <span className="stat-number">
                  {profileStats?.totalRecipes || 0}
                </span>
                <span className="stat-label">Công thức</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">
                  {profileStats?.totalFollowers || 0}
                </span>
                <span className="stat-label">Người theo dõi</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{totalLikes}</span>
                <span className="stat-label">Tổng lượt thích</span>
              </div>
            </div>

            <button
              className="btn-edit-profile"
              onClick={() => {
                navigate("/edit-profile");
              }}
            >
              Chỉnh sửa hồ sơ
            </button>
          </div>
        </div>
      </div>

      {/* KHỐI QUẢN LÝ CÔNG THỨC (MY RECIPES) */}
      <div className="management-section">
        <h2 className="section-title">
          <TrendingUp size={24} color="var(--color-primary)" /> Quản lý công
          thức
        </h2>

        {myRecipes.length === 0 ? (
          <div className="empty-recipes-state">
            <p>Bạn chưa chia sẻ công thức nào.</p>
            <a href="/write" className="btn-primary-link">
              Bắt đầu viết ngay!
            </a>
          </div>
        ) : (
          <div className="admin-recipe-grid">
            {myRecipes.map((recipe) => (
              <Link
                to={`/recipe/${recipe.slug}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div key={recipe.id} className="admin-recipe-card">
                  {/* BỌC LINK VÀO ĐÂY ĐỂ CLICK XEM CHI TIẾT */}
                  <img
                    src={
                      recipe.coverImageUrl || "https://via.placeholder.com/300"
                    }
                    alt={recipe.title}
                    className="admin-recipe-img"
                  />
                  <div className="admin-recipe-content">
                    <h3 className="admin-recipe-title">{recipe.title}</h3>
                    <div className="admin-recipe-metrics">
                      <span>
                        <Heart size={14} /> {recipe.favoriteCount}
                      </span>
                    </div>
                  </div>

                  {/* OVERLAY SỬA/XÓA VẪN GIỮ NGUYÊN BÊN NGOÀI LINK */}
                  <div className="admin-actions-overlay">
                    <button
                      className="btn-action edit"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/edit-recipe/${recipe.slug}`;
                      }}
                    >
                      <Edit size={16} /> Sửa
                    </button>
                    <button
                      className="btn-action delete"
                      onClick={(e) => openDeleteModal(e, recipe)}
                    >
                      <Trash2 size={16} /> Xóa
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Clock, UserPlus, UserCheck, ChefHat } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import apiClient from "../../services/apiClient";
import { authUtils } from "../../utils/authUtils";
import "./PublicProfilePage.css";

export const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tách riêng state cho nút Follow để làm Optimistic UI (nhấp nháy đổi trạng thái ngay)
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const currentUser = authUtils.getUserInfo();
  const isLoggedIn = authUtils.isLoggedIn();

  useEffect(() => {
    // Nếu vô tình người dùng bấm vào profile của chính mình -> Đẩy về trang quản lý cá nhân
    if (currentUser && currentUser.id === userId) {
      navigate("/profile", { replace: true });
      return;
    }

    const fetchPublicProfile = async () => {
      try {
        const res = await apiClient.get(
          `/api/features/users/profile/${userId}`,
        );
        setProfile(res.data);
        setIsFollowing(res.data.isFollowing);
        setFollowerCount(res.data.totalFollowers);
      } catch (error) {
        toast.error("Không tìm thấy đầu bếp này!");
        setTimeout(() => navigate(-1), 1500); // Lỗi thì quay lại trang trước
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId, navigate]);

  const handleToggleFollow = async () => {
    if (!isLoggedIn) {
      return toast.error("Vui lòng đăng nhập để theo dõi đầu bếp này!");
    }

    try {
      await apiClient.post(`/api/features/interactions/users/${userId}/follow`);

      // Đảo trạng thái ngay trên UI
      setIsFollowing(!isFollowing);
      setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));

      if (!isFollowing) toast.success(`Đã theo dõi ${profile.displayName}`);
    } catch (error) {
      toast.error("Không thể thao tác lúc này.");
    }
  };

  if (isLoading)
    return (
      <div className="public-profile-loading">Đang ghé thăm gian bếp...</div>
    );
  if (!profile) return null;

  return (
    <div className="public-profile-container">
      <Toaster position="top-center" />

      {/* 1. KHỐI HEADER BÌA VÀ AVATAR */}
      <div className="public-header-card animation-slide-down">
        <div className="public-cover">
          <img
            src={
              profile.coverUrl ||
              "https://images.unsplash.com/photo-1495195129352-aeb325a55b65?auto=format&fit=crop&w=1200"
            }
            alt="Cover"
          />
        </div>

        <div className="public-info-section">
          <div className="public-avatar-wrapper">
            <img
              src={
                profile.avatarUrl ||
                `https://ui-avatars.com/api/?name=${profile.displayName}`
              }
              alt="Avatar"
              className="public-avatar-img"
            />
          </div>

          <div className="public-details-container">
            <div className="public-details-text">
              <h1 className="public-name">{profile.displayName}</h1>
              <p className="public-bio">
                {profile.bio || "Người yêu ẩm thực và đam mê nấu nướng."}
              </p>

              <div className="public-stats-grid">
                <div className="stat-box">
                  <span className="stat-number">{profile.totalRecipes}</span>
                  <span className="stat-label">Công thức</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">{followerCount}</span>
                  <span className="stat-label">Người theo dõi</span>
                </div>
              </div>
            </div>

            <div className="public-action-box">
              <button
                className={`btn-follow-large ${isFollowing ? "following" : ""}`}
                onClick={handleToggleFollow}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={18} /> Đang theo dõi
                  </>
                ) : (
                  <>
                    <UserPlus size={18} /> Theo dõi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KHỐI DANH SÁCH CÔNG THỨC */}
      <div className="public-recipes-section">
        <h2 className="section-title">
          <ChefHat size={24} color="var(--color-primary)" /> Món ngon của{" "}
          {profile.displayName}
        </h2>

        {profile.recipes.length === 0 ? (
          <div className="public-empty-state">
            <p>Đầu bếp này chưa chia sẻ công thức nào.</p>
          </div>
        ) : (
          <div className="public-recipe-grid">
            {profile.recipes.map((recipe, index) => (
              <Link
                to={`/recipe/${recipe.slug}`}
                key={recipe.id}
                className="public-recipe-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="src-img-wrapper">
                  <img
                    src={
                      recipe.coverImageUrl || "https://via.placeholder.com/300"
                    }
                    alt={recipe.title}
                  />
                  <div className="src-likes-badge">
                    <Heart size={12} fill="currentColor" />{" "}
                    {recipe.favoriteCount}
                  </div>
                </div>
                <div className="src-content">
                  <h3 className="src-title">{recipe.title}</h3>
                  <div className="src-meta">
                    <span className="src-time">
                      <Clock size={12} /> {recipe.totalTimeMinutes} phút
                    </span>
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

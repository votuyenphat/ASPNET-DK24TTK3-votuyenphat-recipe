import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Users,
  ChefHat,
  Bookmark,
  Heart,
  Share2,
  Play,
  Check,
  Flame,
  CookingPot,
  Utensils,
  Star,
  MessageCircle,
  Tag,
} from "lucide-react";
import apiClient from "../../services/apiClient";
import "./RecipeDetailPage.css";
import toast, { Toaster } from "react-hot-toast";
import { CommentSection } from "../../components/organisms/CommentSection/CommentSection";
import { authUtils } from "../../utils/authUtils";
import { ConfirmModal } from "../../components/molecules/ConfirmModal/ConfirmModal";

export const RecipeDetailPage = () => {
  const { slug } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State quản lý việc tích chọn nguyên liệu lúc đứng bếp
  const [checkedIngredients, setCheckedIngredients] = useState({});
  // State bật/tắt chế độ đứng bếp (Kitchen Mode)
  const [isKitchenMode, setIsKitchenMode] = useState(false);

  // Bổ sung state quản lý tương tác
  const [interactionStats, setInteractionStats] = useState({
    favoriteCount: 0,
    followerCount: 0,
    isFavorited: false, // Để đổi màu trái tim
    isFollowing: false, // Để đổi màu nút Theo dõi
  });

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false); // Trạng thái mở modal confirm vote
  const [pendingRating, setPendingRating] = useState(0);

  useEffect(() => {
    const fetchRecipeDetail = async () => {
      try {
        const response = await apiClient.get(`/api/features/recipes/${slug}`);
        setRecipe(response.data);
        setUserRating(response.data.currentUserRating || 0);
        // SỬA TẠI ĐÂY: Dùng dữ liệu thật từ Backend thay vì hardcode "false"
        setInteractionStats({
          favoriteCount: response.data.favoriteCount || 0,
          followerCount: response.data.authorFollowers || 0,
          isFavorited: response.data.isFavorited || false, // Đọc cờ từ Backend
          isFollowing: response.data.isFollowing || false, // Đọc cờ từ Backend
        });
      } catch (error) {
        console.error("Lỗi khi tải chi tiết công thức:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipeDetail();
  }, [slug]);

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";

    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) {
      return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }

    // youtube.com/watch?v=VIDEO_ID
    const longMatch = url.match(/[?&]v=([^&]+)/);
    if (longMatch) {
      return `https://www.youtube.com/embed/${longMatch[1]}`;
    }

    return "";
  };

  const toggleIngredient = (id) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleFavorite = async () => {
    try {
      await apiClient.post(
        `/api/features/interactions/recipes/${recipe.id}/favorite`,
      );

      // Cập nhật giao diện ngay lập tức (Optimistic UI)
      setInteractionStats((prev) => ({
        ...prev,
        isFavorited: !prev.isFavorited,
        favoriteCount: prev.isFavorited
          ? prev.favoriteCount - 1
          : prev.favoriteCount + 1,
      }));
    } catch (error) {
      toast.error("Vui lòng đăng nhập để thả tim công thức!");
    }
  };

  const handleToggleFollow = async () => {
    try {
      await apiClient.post(
        `/api/features/interactions/users/${recipe.authorId}/follow`,
      );

      setInteractionStats((prev) => ({
        ...prev,
        isFollowing: !prev.isFollowing,
        followerCount: prev.isFollowing
          ? prev.followerCount - 1
          : prev.followerCount + 1,
      }));
    } catch (error) {
      toast.error("Vui lòng đăng nhập để theo dõi tác giả!");
    }
  };

  const handleRateRecipe = async (starCount) => {
    if (!authUtils.isLoggedIn()) {
      toast.error("Vui lòng đăng nhập để đánh giá món ăn!");
      return;
    }

    try {
      await apiClient.post(
        `/api/features/interactions/recipes/${recipe.id}/rate`,
        { starCount },
      );
      setUserRating(starCount);

      // Tùy chọn: Có thể fetch lại API lấy chi tiết để cập nhật số điểm trung bình mới ngay lập tức
    } catch (error) {
      toast.error("Không thể gửi đánh giá.");
    }
  };

  const handleStarClick = (starCount) => {
    setPendingRating(starCount); // Tạm lưu số sao định vote
    setIsRateModalOpen(true); // Mở modal hỏi lại cho chắc
  };

  const handleConfirmRate = async () => {
    setIsRateModalOpen(false); // Đóng modal
    const loadingToast = toast.loading("Đang gửi đánh giá của bạn...");

    try {
      // Gọi API POST gửi số sao lên
      handleRateRecipe(pendingRating);
      setUserRating(pendingRating); // Cập nhật số sao chính thức lên giao diện
      toast.success(`Cảm ơn bạn đã đánh giá ${pendingRating} sao!`, {
        id: loadingToast,
      });

      // Tùy chọn: Bạn có thể fetch lại chi tiết recipe tại đây để cập nhật trường "recipe.averageRating" (Điểm trung bình tổng)
    } catch (error) {
      toast.error("Vui lòng đăng nhập để đánh giá món ăn này.", {
        id: loadingToast,
      });
    }
  };

  if (isLoading)
    return (
      <div className="detail-loading">
        Đang chuẩn bị nguyên liệu và thớt dao...
      </div>
    );
  if (!recipe)
    return (
      <div className="detail-error">Không tìm thấy công thức yêu cầu.</div>
    );

  return (
    <div
      className={`recipe-detail-wrapper ${isKitchenMode ? "kitchen-active" : ""}`}
    >
      <Toaster position="top-center" />
      {/* Thanh điều khiển nổi: Bật tắt chế độ nấu ăn nhanh */}
      <div className="kitchen-mode-bar">
        <div className="mode-bar-container">
          <p>
            💡{" "}
            {isKitchenMode
              ? "Đang bật chế độ đứng bếp - Chữ to, dễ tương tác từ xa"
              : "Bạn chuẩn bị vào bếp nấu món này?"}
          </p>
          <button
            className={`btn-toggle-kitchen ${isKitchenMode ? "active" : ""}`}
            onClick={() => setIsKitchenMode(!isKitchenMode)}
          >
            <CookingPot size={18} />
            {isKitchenMode ? "Thoát chế độ đứng bếp" : "Bật chế độ đứng bếp"}
          </button>
        </div>
      </div>

      <div className="recipe-detail-layout">
        {/* ==========================================
            CỘT TRÁI: HÌNH ẢNH & LUỒNG NẤU ĂN CHÍNH
            ========================================== */}
        <div className="main-recipe-content">
          {/* Cover Image độc quyền có hiệu ứng Parallax nhẹ khi hover */}
          <motion.div
            className="recipe-hero-cover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={
                recipe.coverImageUrl || "https://via.placeholder.com/800x450"
              }
              alt={recipe.title}
            />
            <div className="cover-gradient-overlay">
              {recipe.categoryName && (
                <span className="recipe-category-tag">
                  {recipe.categoryName}
                </span>
              )}
            </div>
          </motion.div>

          {/* Tiêu đề & Cốt truyện mô tả món ăn */}
          <div className="recipe-intro-section">
            <h1 className="recipe-main-title">{recipe.title}</h1>
            <p className="recipe-description-text">
              {recipe.description ||
                "Món ăn mang hương vị ấm cúng, đậm đà cho những bữa cơm sum họp gia đình."}
            </p>
          </div>

          {/* KHỐI NGUYÊN LIỆU (KITCHEN FRIENDLY CARD) */}
          <motion.div
            className="ingredients-card-box"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="box-header">
              <Utensils size={22} color="var(--color-primary)" />
              <h2>Nguyên liệu cần chuẩn bị</h2>
              <span className="servings-counter">
                ({recipe.servings} phần ăn)
              </span>
            </div>

            <div className="ingredients-interactive-list">
              {recipe.ingredients.map((ing) => (
                <div
                  key={ing.ingredientId}
                  className={`ingredient-item-row ${checkedIngredients[ing.ingredientId] ? "checked" : ""}`}
                  onClick={() => toggleIngredient(ing.ingredientId)}
                >
                  <div className="checkbox-ui">
                    {checkedIngredients[ing.ingredientId] && (
                      <Check size={14} color="white" />
                    )}
                  </div>
                  <span className="ing-name">{ing.name}</span>
                  <div className="ing-dots-spacer"></div>
                  <span className="ing-amount">
                    {ing.amount} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* KHỐI CÁC BƯỚC NẤU (VISUAL TIMELINE) */}
          <div className="instruction-steps-section">
            <h2 className="steps-section-title">
              <CookingPot size={22} /> Các bước thực hiện
            </h2>

            <div className="steps-timeline-flow">
              {recipe.steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="timeline-step-card"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="step-number-node">
                    <span>{step.stepOrder}</span>
                  </div>
                  <div className="step-body-content">
                    <p className="step-text-detail">{step.content}</p>
                    {step.imageUrl && (
                      <div className="step-image-wrapper">
                        <img
                          src={step.imageUrl}
                          alt={`Bước ${step.stepOrder}`}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="related-tags-section" style={{ marginTop: "40px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <Tag size={18} color="var(--color-primary)" /> Khám phá thêm
              </h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {recipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    onClick={() => navigate(`/search?tag=${tag}`)} // Click để chuyển hướng sang trang tìm kiếm
                    style={{
                      backgroundColor: "var(--color-bg-main)",
                      color: "var(--color-text-primary)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border: "1px solid #e2e8f0",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.borderColor = "var(--color-primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.borderColor = "#e2e8f0")
                    }
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <ConfirmModal
            isOpen={isRateModalOpen}
            title="Xác nhận đánh giá?"
            message={`Bạn có chắc chắn muốn đánh giá món ăn này ${pendingRating} sao không?`}
            confirmText="Đồng ý"
            cancelText="Hủy bỏ"
            isDestructive={false} // Hiện nút màu xanh (Primary) thay vì màu đỏ nguy hiểm
            onConfirm={handleConfirmRate}
            onCancel={() => setIsRateModalOpen(false)}
          />

          <div
            className="user-rating-section"
            style={{
              marginTop: "32px",
              padding: "24px",
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>
              Bạn đánh giá món ăn này thế nào?
            </h3>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "8px" }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  fill={
                    star <= (hoverRating || userRating) ? "#f59e0b" : "white"
                  }
                  color={
                    star <= (hoverRating || userRating) ? "#f59e0b" : "#cbd5e1"
                  }
                  style={{ cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleStarClick(star)}
                />
              ))}
            </div>
            {userRating > 0 && (
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--color-primary)",
                  marginTop: "8px",
                  fontWeight: "bold",
                }}
              >
                Bạn đã đánh giá {userRating} sao
              </p>
            )}
          </div>

          <CommentSection recipeId={recipe.id} />
        </div>

        {/* ==========================================
            CỘT PHẢI: STICKY SIDE WIDGET (THÔNG SỐ ĐỘC LẬP)
            ========================================== */}
        <aside className="recipe-sticky-sidebar">
          <div className="sticky-inner-panel">
            {/* Thẻ thông số thời gian & độ khó */}
            <div className="sidebar-widget metrics-widget">
              <div className="metric-row">
                <div className="metric-item">
                  <Star size={20} color="#f59e0b" className="icon-p" />
                  <div>
                    <span className="m-label">Đánh giá</span>
                    <span className="m-val">
                      {recipe.averageRating > 0
                        ? `${recipe.averageRating}/5`
                        : "Chưa có"}
                    </span>
                  </div>
                </div>
                <div className="metric-item">
                  <MessageCircle size={20} className="icon-p" />
                  <div>
                    <span className="m-label">Bình luận</span>
                    <span className="m-val">{recipe.commentCount}</span>
                  </div>
                </div>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-single-row">
                <ChefHat size={20} color="var(--color-primary)" />
                <span>
                  Mức độ:{" "}
                  <strong>
                    {recipe.difficulty === 1
                      ? "Dễ làm"
                      : recipe.difficulty === 2
                        ? "Trung bình"
                        : "Thách thức"}
                  </strong>
                </span>
              </div>
            </div>

            {/* Thẻ tác giả (Author Info) */}
            <div className="sidebar-widget author-widget">
              <img
                src={
                  recipe.authorAvatar ||
                  `https://ui-avatars.com/api/?name=${recipe.authorName}`
                }
                alt="author"
                className="chef-avatar-large"
              />
              <div className="chef-meta">
                <span className="widget-label">Người chia sẻ</span>
                <h4 className="chef-title-name">{recipe.authorName}</h4>
                <span
                  style={{ fontSize: "12px", color: "var(--color-text-hint)" }}
                >
                  {interactionStats.followerCount} người theo dõi
                </span>
              </div>

              <button
                className={`btn-follow-chef ${interactionStats.isFollowing ? "following" : ""}`}
                onClick={handleToggleFollow}
                style={
                  interactionStats.isFollowing
                    ? {
                        backgroundColor: "var(--color-text-primary)",
                        color: "white",
                      }
                    : {}
                }
              >
                {interactionStats.isFollowing ? "Đang theo dõi" : "Theo dõi"}
              </button>
            </div>

            {/* Các nút tương tác nhanh */}
            <div className="sidebar-actions-grid">
              <button
                className="btn-action-side save"
                onClick={handleToggleFavorite}
                style={
                  interactionStats.isFavorited
                    ? { backgroundColor: "var(--color-error)", color: "white" }
                    : {}
                }
              >
                <Heart
                  size={18}
                  fill={interactionStats.isFavorited ? "currentColor" : "none"}
                />
                Thả tim ({interactionStats.favoriteCount})
              </button>

              <button
                className="btn-action-side share"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Đã copy đường dẫn bài viết!");
                }}
              >
                <Share2 size={18} /> Chia sẻ
              </button>
            </div>

            {/* Banner Video bổ trợ nấu ăn nếu có link Youtube */}
            {recipe.youtubeVideoUrl && (
              <div className="sidebar-widget">
                <div className="video-wrapper">
                  <iframe
                    width="100%"
                    height="220"
                    src={getYoutubeEmbedUrl(recipe.youtubeVideoUrl)}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {recipe.tags && recipe.tags.length > 0 && (
              <div
                className="recipe-tags-section"
                style={{
                  marginTop: "32px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                {recipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: "var(--color-bg-main)",
                      color: "var(--color-primary)",
                      padding: "6px 12px",
                      borderRadius: "99px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

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
} from "lucide-react";
import apiClient from "../../services/apiClient";
import "./RecipeDetailPage.css";

export const RecipeDetailPage = () => {
  const { slug } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State quản lý việc tích chọn nguyên liệu lúc đứng bếp
  const [checkedIngredients, setCheckedIngredients] = useState({});
  // State bật/tắt chế độ đứng bếp (Kitchen Mode)
  const [isKitchenMode, setIsKitchenMode] = useState(false);

  useEffect(() => {
    const fetchRecipeDetail = async () => {
      try {
        const response = await apiClient.get(`/api/features/recipes/${slug}`);
        setRecipe(response.data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết công thức:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipeDetail();
  }, [slug]);

  const toggleIngredient = (id) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
                  <Clock size={20} className="icon-p" />
                  <div>
                    <span className="m-label">Chuẩn bị</span>
                    <span className="m-val">{recipe.prepTimeMinutes} phút</span>
                  </div>
                </div>
                <div className="metric-item">
                  <Flame size={20} className="icon-p" />
                  <div>
                    <span className="m-label">Chế biến</span>
                    <span className="m-val">{recipe.cookTimeMinutes} phút</span>
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
                alt={recipe.authorName}
                className="chef-avatar-large"
              />
              <div className="chef-meta">
                <span className="widget-label">Người chia sẻ</span>
                <h4 className="chef-title-name">{recipe.authorName}</h4>
              </div>
              <button className="btn-follow-chef">Theo dõi</button>
            </div>

            {/* Các nút tương tác nhanh */}
            <div className="sidebar-actions-grid">
              <button className="btn-action-side save">
                <Heart size={18} /> Thả tim ({recipe.favoriteCount})
              </button>
              <button className="btn-action-side share">
                <Share2 size={18} /> Chia sẻ
              </button>
            </div>

            {/* Banner Video bổ trợ nấu ăn nếu có link Youtube */}
            {recipe.youtubeVideoUrl && (
              <div className="sidebar-widget video-link-widget">
                <div className="video-thumb-mock">
                  <Play size={32} color="white" />
                  <span>Xem video hướng dẫn</span>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Star,
  Coffee,
  TrendingUp,
  Award,
  Leaf,
  Megaphone,
  Eye,
} from "lucide-react";
import "./HomeBentoGrid.css";
import apiClient from "../../../services/apiClient";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export const HomeBentoGrid = () => {
  const navigate = useNavigate();
  const [bentoData, setBentoData] = useState(null);

  // STATE ĐIỀU KHIỂN XOAY TUA SLIDE QUẢNG CÁO
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    apiClient
      .get("/api/Admin/bento-data")
      .then((res) => setBentoData(res.data))
      .catch((err) => console.error("Lỗi lấy dữ liệu bento:", err));
  }, []);

  // ĐẶT TIMEOUT XOAY VÒNG QUẢNG CÁO MỖI 4 GIÂY
  useEffect(() => {
    if (bentoData?.sponsoredRecipes && bentoData.sponsoredRecipes.length > 1) {
      const adTimer = setInterval(() => {
        setCurrentAdIndex(
          (prevIndex) => (prevIndex + 1) % bentoData.sponsoredRecipes.length,
        );
      }, 4000);

      return () => clearInterval(adTimer); // Dọn dẹp bộ nhớ khi unmount
    }
  }, [bentoData]);

  if (!bentoData)
    return <div className="bento-loading">Đang nung lò Bento...</div>;

  return (
    <motion.div
      className="bento-grid"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* 1. MÓN NỔI BẬT */}
      {bentoData.heroRecipe && (
        <motion.div
          className="bento-item bento-hero clickable"
          variants={itemVariants}
          onClick={() => navigate(`/recipe/${bentoData.heroRecipe.slug}`)}
        >
          <img
            src={bentoData.heroRecipe.coverImageUrl}
            alt="Hero"
            className="bento-bg"
          />
          <div className="bento-content">
            <span className="bento-tag">
              <Flame size={14} /> Món nổi bật
            </span>
            <h2>{bentoData.heroRecipe.title}</h2>
            <p>Bởi {bentoData.heroRecipe.displayName}</p>
          </div>
        </motion.div>
      )}

      {/* 2. KHÁM PHÁ */}
      <motion.div
        className="bento-item bento-category clickable"
        variants={itemVariants}
        onClick={() => navigate("/search")}
      >
        <div className="bento-icon-box">
          <Coffee size={24} color="var(--color-primary)" />
        </div>
        <h3>
          Khám phá
          <br />
          thế giới ẩm thực
        </h3>
      </motion.div>

      {/* 3. TÀI TRỢ (ĐÃ FIX: XOAY TUA TỰ ĐỘNG CHO MỌI SỐ LƯỢNG BÀI SET) */}
      {bentoData.sponsoredRecipes && bentoData.sponsoredRecipes.length > 0 && (
        <motion.div className="bento-item bento-ad" variants={itemVariants}>
          <div className="ad-header-badge">
            <Megaphone size={12} /> Tài trợ
          </div>

          {/* KHUNG NHÌN VẬN CHUYỂN DỮ LIỆU */}
          <div className="ad-scroll-viewport">
            {/* ĐƯỜNG CHẠY CSS ANIMATION (Chạy dọc vô tận) */}
            <div className="ad-scroll-track">
              {/* Vòng lặp hiển thị mảng dữ liệu đã được nhân bản từ Backend */}
              {bentoData.sponsoredRecipes.map((recipe, index) => (
                <div key={index} className="ad-item">
                  <img
                    src={recipe.coverImageUrl}
                    alt={recipe.title}
                    className="ad-item-bg"
                  />
                  <div className="ad-item-title">{recipe.title}</div>

                  {/* ====================================================
                      HOVER OVERLAY: MÀNG PHỦ "KHÁM PHÁ NGAY" 
                      ==================================================== */}
                  <div className="ad-hover-overlay">
                    <div className="overlay-content">
                      <div className="cta-button-mini">
                        <Eye size={16} />{" "}
                        <span className="cta-button-mini-content">
                          Khám phá ngay
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nút bấm thật sự phủ lên toàn bộ ô để navigate */}
                  <button
                    className="full-card-link-btn"
                    onClick={() => navigate(`/recipe/${recipe.slug}`)}
                  ></button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. TRENDING TAGS */}
      <motion.div className="bento-item bento-trending" variants={itemVariants}>
        <div className="trending-header">
          <TrendingUp size={20} color="var(--color-text-primary)" />
          <h3>Từ khóa HOT</h3>
        </div>
        <div className="trending-tags">
          {bentoData.hotTags &&
            bentoData.hotTags.map((tag, idx) => (
              <span
                key={idx}
                className="tag clickable"
                onClick={() => navigate(`/search?tag=${tag}`)}
              >
                #{tag}
              </span>
            ))}
        </div>
      </motion.div>

      {/* 5. MẸO NHÀ BẾP */}
      <motion.div className="bento-item bento-tip" variants={itemVariants}>
        <div className="tip-content">
          <Star size={20} color="#f59e0b" />
          <div>
            <h4>Mẹo nhà bếp</h4>
            <p>{bentoData.kitchenTip}</p>
          </div>
        </div>
      </motion.div>

      {/* 6. TOP CHEF */}
      {bentoData.topChef && (
        <motion.div
          className="bento-item bento-chef clickable"
          variants={itemVariants}
          onClick={() => navigate(`/chef/${bentoData.topChef.id}`)}
        >
          <div className="chef-header">
            <Award size={20} color="#8b5cf6" />
            <span className="chef-title">Top Đầu Bếp</span>
          </div>
          <div className="chef-profile">
            <img
              src={
                bentoData.topChef.avatarUrl ||
                `https://ui-avatars.com/api/?name=${bentoData.topChef.displayName}`
              }
              alt="Chef"
              className="chef-avatar"
            />
            <span className="chef-name">{bentoData.topChef.displayName}</span>
            <span className="chef-stats">
              {bentoData.topChef.totalFollowers} người theo dõi
            </span>
          </div>
        </motion.div>
      )}

      {/* 7. THỬ THÁCH */}
      {bentoData.challenge && (
        <motion.div
          className="bento-item bento-challenge clickable"
          variants={itemVariants}
          onClick={() => navigate("/challenges")}
        >
          <div className="challenge-icon-wrapper">
            <Leaf size={28} color="#10b981" />
          </div>
          <div className="challenge-text">
            <span className="challenge-badge">Sự kiện</span>
            <h4>{bentoData.challenge.title}</h4>
            <p>{bentoData.challenge.desc}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

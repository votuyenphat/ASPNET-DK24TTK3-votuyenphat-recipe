import React from "react";
import { motion } from "framer-motion";
import { Flame, Star, Coffee, TrendingUp, Award, Leaf } from "lucide-react";
import "./HomeBentoGrid.css";
import { VerticalAdBanner } from "../../molecules/VerticalAdBanner/VerticalAdBanner";

// Cấu hình animation stagger (từng ô hiện lên lần lượt)
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }, // Mỗi ô cách nhau 0.1s
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export const HomeBentoGrid = () => {
  return (
    <motion.div
      className="bento-grid"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Ô số 1: Công thức nổi bật (To nhất - Span 2 cột, 2 hàng) */}
      <motion.div className="bento-item bento-hero" variants={itemVariants}>
        <img
          src="https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80"
          alt="Featured Recipe"
          className="bento-bg"
        />
        <div className="bento-content">
          <span className="bento-tag">
            <Flame size={14} /> Nổi bật hôm nay
          </span>
          <h2>Mì Ý Hải Sản Xốt Cà Chua Cực Đỉnh</h2>
          <p>Công thức độc quyền từ Đầu bếp danh tiếng</p>
        </div>
      </motion.div>

      {/* Ô số 2: Khám phá danh mục */}
      <motion.div className="bento-item bento-category" variants={itemVariants}>
        <div className="bento-icon-box">
          <Coffee size={24} color="var(--color-primary)" />
        </div>
        <h3>
          Bữa sáng <br />
          nhanh gọn
        </h3>
      </motion.div>

      {/* Ô số 3: Quảng cáo chạy dọc (Span 1 cột, 2 hàng) */}
      <motion.div className="bento-item bento-ad" variants={itemVariants}>
        <VerticalAdBanner />
      </motion.div>

      {/* Ô số 4: Xu hướng */}
      <motion.div className="bento-item bento-trending" variants={itemVariants}>
        <div className="trending-header">
          <TrendingUp size={20} color="var(--color-text-primary)" />
          <h3>Từ khóa HOT</h3>
        </div>
        <div className="trending-tags">
          <span className="tag">#GiamCan</span>
          <span className="tag">#AnChay</span>
          <span className="tag">#BentoNhat</span>
        </div>
      </motion.div>

      {/* Ô số 5: Mẹo nhà bếp (Span 2 cột) */}
      <motion.div className="bento-item bento-tip" variants={itemVariants}>
        <div className="tip-content">
          <Star size={20} color="#f59e0b" />
          <div>
            <h4>Mẹo nhà bếp</h4>
            <p>
              Cách giữ rau củ tươi lâu hơn 2 tuần trong tủ lạnh mà không bị dập
              nát.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div className="bento-item bento-chef" variants={itemVariants}>
        <div className="chef-header">
          <Award size={20} color="#8b5cf6" />
          <span className="chef-title">Top Đầu Bếp</span>
        </div>
        <div className="chef-profile">
          <img
            src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=150&q=80"
            alt="Chef"
            className="chef-avatar"
          />
          <span className="chef-name">Hương Vị Quê Nhà</span>
          <span className="chef-stats">1.2k người theo dõi</span>
        </div>
      </motion.div>

      {/* Ô số 7: Sự kiện / Thử thách (Span 1 cột) */}
      <motion.div
        className="bento-item bento-challenge"
        variants={itemVariants}
      >
        <div className="challenge-icon-wrapper">
          <Leaf size={28} color="#10b981" />
        </div>
        <div className="challenge-text">
          <span className="challenge-badge">Thử thách tuần</span>
          <h4>Món ngon từ Sen</h4>
          <p>Tham gia ngay ➔</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

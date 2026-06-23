import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Award, Flame, Sparkles, TrendingUp, Clock, Heart } from "lucide-react";
import { HomeBentoGrid } from "../../components/organisms/HomeBentoGrid/HomeBentoGrid";
import { RecipeCard } from "../../components/molecules/RecipeCard/RecipeCard";
import apiClient from "../../services/apiClient";
import "./HomePage.css";

export const HomePage = () => {
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState({
    featuredRecipes: [],
    newestRecipes: [],
    hotTags: [],
  });
  const [sponsoredContent, setSponsoredContent] = useState(null); // State chờ API Admin tài trợ
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // 1. Lấy dữ liệu tổng hợp từ API Home
        const response = await apiClient.get("/api/features/home");
        const sponsorResp = await apiClient.get("/api/features/home/init");

        setHomeData({
          // Cắt đúng 3 món nổi bật nhất để làm Bảng xếp hạng Top 3
          featuredRecipes: response.data.featuredRecipes.slice(0, 3),
          newestRecipes: response.data.newestRecipes,
          hotTags: response.data.hotTags,
        });

        const sponsor = sponsorResp.data.activeBanner;
        setSponsoredContent({
          title: sponsor.title,
          brand: sponsor.brandName,
          imageUrl: sponsor.imageUrl,
          link: sponsor.targetUrl,
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (isLoading) {
    return (
      <div className="home-loading">Đang chuẩn bị những món ngon nhất...</div>
    );
  }

  return (
    <div className="home-page-container">
      {/* 1. LƯỚI BENTO MỞ ĐẦU (Giữ nguyên component của bạn) */}
      <HomeBentoGrid />

      {/* 2. TỪ KHÓA HOT (HOT TAGS) - Dạng thanh trượt ngang */}
      {homeData.hotTags.length > 0 && (
        <section className="home-section hot-tags-section animation-slide-up">
          <div className="section-header">
            <h2 className="section-title">
              <Flame color="#ef4444" /> Xu hướng tìm kiếm
            </h2>
          </div>
          <div className="hot-tags-scroll">
            {homeData.hotTags.map((tag, idx) => (
              <button
                key={idx}
                className="hot-tag-pill"
                onClick={() => navigate(`/search?tag=${tag}`)}
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. BẢNG XẾP HẠNG TOP 3 NỔI BẬT */}
      {homeData.featuredRecipes.length > 0 && (
        <section
          className="home-section featured-section animation-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="section-header">
            <h2 className="section-title">
              <Award color="#f59e0b" /> Top 3 Công Thức Xuất Sắc
            </h2>
            <p className="section-subtitle">
              Những món ăn được cộng đồng yêu thích và đánh giá cao nhất
            </p>
          </div>

          <div className="top3-grid">
            {homeData.featuredRecipes.map((recipe, index) => (
              <Link
                to={`/recipe/${recipe.slug}`}
                key={recipe.id}
                className={`top3-card rank-${index + 1}`}
              >
                {/* HUY HIỆU XẾP HẠNG (Vàng, Bạc, Đồng) */}
                <div className="rank-badge">
                  {index === 0
                    ? "👑 Hạng 1"
                    : index === 1
                      ? "🥈 Hạng 2"
                      : "🥉 Hạng 3"}
                </div>

                <div className="top3-img-wrapper">
                  <img
                    src={
                      recipe.coverImageUrl || "https://via.placeholder.com/400"
                    }
                    alt={recipe.title}
                  />
                  <div className="top3-overlay">
                    <span className="top3-likes">
                      <Heart size={14} fill="currentColor" />{" "}
                      {recipe.favoriteCount}
                    </span>
                  </div>
                </div>

                <div className="top3-content">
                  <h3 className="top3-title">{recipe.title}</h3>
                  <div className="top3-meta">
                    <div className="author-info">
                      <img
                        src={
                          recipe.authorAvatar ||
                          `https://ui-avatars.com/api/?name=${recipe.authorName}`
                        }
                        alt="avatar"
                      />
                      <span>{recipe.authorName}</span>
                    </div>
                    <span className="time-info">
                      <Clock size={12} /> {recipe.totalTimeMinutes}p
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. KHU VỰC TÀI TRỢ (SPONSORED) - Dành riêng cho Admin quản lý */}
      {sponsoredContent && (
        <section
          className="home-section sponsored-section animation-slide-up"
          style={{ marginBottom: "40px" }}
        >
          <div
            className="sponsored-banner"
            onClick={() => {
              // Nếu link nội bộ thì navigate, nếu link ngoài thì open tab mới
              if (sponsoredContent.link.startsWith("http")) {
                window.open(sponsoredContent.link, "_blank");
              } else {
                navigate(sponsoredContent.link);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <img
              src={sponsoredContent.imageUrl}
              alt={sponsoredContent.title}
              className="sponsored-bg"
            />
            <div className="sponsored-overlay">
              <div className="sponsored-tag">
                <Sparkles size={14} /> Gợi ý tài trợ
              </div>
              <h2 className="sponsored-title">{sponsoredContent.title}</h2>
              <p className="sponsored-brand">{sponsoredContent.brand}</p>
            </div>
          </div>
        </section>
      )}

      {/* 5. FEED: MỚI NHẤT HÔM NAY (Sử dụng RecipeCard Component) */}
      {homeData.newestRecipes.length > 0 && (
        <section
          className="home-section feed-section animation-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="section-header">
            <h2 className="section-title">
              <TrendingUp color="var(--color-primary)" /> Mới nhất hôm nay
            </h2>
            <button
              className="btn-view-all"
              onClick={() => navigate("/search")}
            >
              Xem tất cả
            </button>
          </div>

          <div className="recipe-grid">
            {homeData.newestRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

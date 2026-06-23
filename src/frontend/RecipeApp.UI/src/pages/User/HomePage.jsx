import React, { useEffect, useState } from "react";
import "./HomePage.css"; // Sẽ tạo file CSS nhỏ bên dưới
import { HomeBentoGrid } from "../../components/organisms/HomeBentoGrid/HomeBentoGrid";
import { RecipeCard } from "../../components/molecules/RecipeCard/RecipeCard";
import apiClient from "../../services/apiClient";

export const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await apiClient.get("/api/features/recipes");
        setRecipes(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách công thức:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div className="home-page-container">
      {/* Lưới Bento nghệ thuật */}
      <HomeBentoGrid />

      {/* Khu vực Feed danh sách công thức */}
      <div className="home-feed-section">
        <h2 className="section-title">Mới nhất hôm nay</h2>

        {isLoading ? (
          <div className="loading-state">Đang tải công thức hấp dẫn...</div>
        ) : recipes.length === 0 ? (
          <div className="empty-state">
            Chưa có công thức nào được đăng. Hãy là người đầu tiên!
          </div>
        ) : (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

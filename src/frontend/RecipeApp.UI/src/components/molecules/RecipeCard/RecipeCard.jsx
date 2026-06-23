import React from "react";
import { Link } from "react-router-dom";
import { Clock, Heart } from "lucide-react";
import "./RecipeCard.css";

export const RecipeCard = ({ recipe }) => {
  return (
    <Link to={`/recipe/${recipe.slug}`} className="recipe-card-link">
      <div className="recipe-card">
        <div className="recipe-cover-wrapper">
          <img
            src={
              recipe.coverImageUrl ||
              "https://via.placeholder.com/400x300?text=Chưa+có+ảnh"
            }
            alt={recipe.title}
            className="recipe-cover"
          />
          <div className="recipe-time-badge">
            <Clock size={12} />
            <span>{recipe.totalTimeMinutes} phút</span>
          </div>
        </div>

        <div className="recipe-info">
          <h3 className="recipe-title">{recipe.title}</h3>

          <div className="recipe-footer">
            <div className="recipe-author">
              <img
                src={
                  recipe.authorAvatar ||
                  `https://ui-avatars.com/api/?name=${recipe.authorName}`
                }
                alt={recipe.authorName}
                className="author-avatar"
              />
              <span className="author-name">{recipe.authorName}</span>
            </div>

            <div className="recipe-stats">
              <Heart size={16} className="heart-icon" />
              <span>{recipe.favoriteCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

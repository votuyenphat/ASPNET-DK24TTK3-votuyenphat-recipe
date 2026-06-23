import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Search as SearchIcon,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  ChefHat,
} from "lucide-react";
import apiClient from "../../services/apiClient";
import { useDebounce } from "../../hooks/useDebounce";
import "./SearchPage.css";

export const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. KHỞI TẠO STATE TỪ URL PARAMETERS
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [tag, setTag] = useState(searchParams.get("tag") || "");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("category") || "",
  );
  const [difficulty, setDifficulty] = useState(
    searchParams.get("difficulty") || "",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);

  // 2. STATE DỮ LIỆU & UI
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Áp dụng Debounce 500ms cho ô gõ text để chống spam API
  const debouncedQuery = useDebounce(query, 500);

  // Lấy danh sách Categories 1 lần để render bộ lọc
  useEffect(() => {
    apiClient
      .get("/api/features/categories")
      .then((res) => setCategories(res.data))
      .catch(console.error);
  }, []);

  // 3. EFFECT GỌI API KHI BỘ LỌC THAY ĐỔI
  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        // Đồng bộ State ngược lại lên URL để có thể Share Link
        const params = new URLSearchParams();
        if (debouncedQuery) params.set("q", debouncedQuery);
        if (tag) params.set("tag", tag);
        if (categoryId) params.set("category", categoryId);
        if (difficulty) params.set("difficulty", difficulty);
        if (sortBy !== "newest") params.set("sort", sortBy);
        if (page > 1) params.set("page", page.toString());

        setSearchParams(params, { replace: true });

        // Gọi API
        const res = await apiClient.get("/api/features/search/advanced", {
          params: {
            query: debouncedQuery,
            tag,
            categoryId: categoryId || null,
            difficulty: difficulty || null,
            sortBy,
            page,
            pageSize: 12,
          },
        });

        setRecipes(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.totalCount);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
    // Chạy lại Effect khi bất kỳ bộ lọc nào thay đổi
  }, [
    debouncedQuery,
    tag,
    categoryId,
    difficulty,
    sortBy,
    page,
    setSearchParams,
  ]);

  // Hàm tiện ích: Reset page về 1 khi đổi bộ lọc khác
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="search-page-container">
      {/* NÚT MỞ FILTER TRÊN MOBILE */}
      <div className="mobile-filter-header">
        <button
          className="btn-open-filter"
          onClick={() => setIsMobileFilterOpen(true)}
        >
          <Filter size={18} /> Lọc kết quả
        </button>
        <span className="mobile-results-count">{totalCount} công thức</span>
      </div>

      {/* ==========================================
          CỘT TRÁI: BỘ LỌC (SIDEBAR)
          ========================================== */}
      <aside className={`search-sidebar ${isMobileFilterOpen ? "open" : ""}`}>
        <div className="sidebar-header-mobile">
          <h3>Bộ lọc</h3>
          <button
            className="btn-close-filter"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="filter-group">
          <div className="search-input-box">
            <SearchIcon size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Nhập tên món..."
              value={query}
              onChange={(e) => handleFilterChange(setQuery, e.target.value)}
            />
            {query && (
              <X
                size={16}
                className="clear-icon"
                onClick={() => handleFilterChange(setQuery, "")}
              />
            )}
          </div>
        </div>

        {/* NẾU ĐANG TÌM THEO TAG -> HIỂN THỊ TAG ĐÓ VÀ CHO PHÉP XÓA */}
        {tag && (
          <div className="filter-group">
            <label className="filter-label">Thẻ đang chọn</label>
            <div className="active-tag-pill">
              #{tag}
              <button onClick={() => handleFilterChange(setTag, "")}>
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="filter-group">
          <label className="filter-label">Danh mục</label>
          <div className="radio-list">
            <label className="custom-radio">
              <input
                type="radio"
                name="cat"
                checked={categoryId === ""}
                onChange={() => handleFilterChange(setCategoryId, "")}
              />
              <span>Tất cả</span>
            </label>
            {categories.map((c) => (
              <label key={c.id} className="custom-radio">
                <input
                  type="radio"
                  name="cat"
                  checked={categoryId === c.id.toString()}
                  onChange={() =>
                    handleFilterChange(setCategoryId, c.id.toString())
                  }
                />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Độ khó</label>
          <div className="radio-list">
            <label className="custom-radio">
              <input
                type="radio"
                name="diff"
                checked={difficulty === ""}
                onChange={() => handleFilterChange(setDifficulty, "")}
              />
              <span>Bất kỳ</span>
            </label>
            <label className="custom-radio">
              <input
                type="radio"
                name="diff"
                checked={difficulty === "1"}
                onChange={() => handleFilterChange(setDifficulty, "1")}
              />
              <span>Dễ</span>
            </label>
            <label className="custom-radio">
              <input
                type="radio"
                name="diff"
                checked={difficulty === "2"}
                onChange={() => handleFilterChange(setDifficulty, "2")}
              />
              <span>Trung bình</span>
            </label>
            <label className="custom-radio">
              <input
                type="radio"
                name="diff"
                checked={difficulty === "3"}
                onChange={() => handleFilterChange(setDifficulty, "3")}
              />
              <span>Khó</span>
            </label>
          </div>
        </div>
      </aside>

      {/* ==========================================
          CỘT PHẢI: KẾT QUẢ TÌM KIẾM
          ========================================== */}
      <main className="search-results-main">
        <div className="results-header">
          <h1 className="results-title">
            {tag
              ? `Khám phá hashtag #${tag}`
              : query
                ? `Kết quả cho "${query}"`
                : "Tất cả công thức"}
            <span className="results-count">({totalCount})</span>
          </h1>

          <div className="sort-dropdown">
            <span className="sort-label">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
              className="sort-select"
            >
              <option value="newest">Mới nhất</option>
              <option value="popular">Phổ biến nhất</option>
              <option value="rating">Đánh giá cao</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="search-loading">
            <div className="spinner-large"></div>
            <p>Đang tải hương vị...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="search-empty-state">
            <ChefHat size={48} color="#cbd5e1" />
            <h2>Chưa tìm thấy món ăn nào!</h2>
            <p>Thử đổi từ khóa hoặc nới lỏng bộ lọc xem sao nhé.</p>
            <button
              className="btn-reset-filters"
              onClick={() => {
                setQuery("");
                setTag("");
                setCategoryId("");
                setDifficulty("");
              }}
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="search-grid">
              {recipes.map((recipe, index) => (
                <Link
                  to={`/recipe/${recipe.slug}`}
                  key={recipe.id}
                  className="search-recipe-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="src-img-wrapper">
                    <img
                      src={
                        recipe.coverImageUrl ||
                        "https://via.placeholder.com/300"
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
                      <span className="src-author">
                        <img
                          src={
                            recipe.authorAvatar ||
                            `https://ui-avatars.com/api/?name=${recipe.authorName}`
                          }
                          alt="avatar"
                        />
                        {recipe.authorName}
                      </span>
                      <span className="src-time">
                        <Clock size={12} /> {recipe.totalTimeMinutes}p
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* PHÂN TRANG */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="btn-page-nav"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        className={`btn-page-num ${page === p ? "active" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="btn-page-nav"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* LỚP PHỦ MÀN HÌNH TỐI KHI MỞ FILTER TRÊN MOBILE */}
      {isMobileFilterOpen && (
        <div
          className="mobile-filter-overlay"
          onClick={() => setIsMobileFilterOpen(false)}
        ></div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Hash, ChefHat, X, Loader2 } from "lucide-react";
import apiClient from "../../../services/apiClient";
import { useDebounce } from "../../../hooks/useDebounce";
import "./HeaderSearch.css";

export const HeaderSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchRef = useRef(null);

  // Dùng hook Debounce vừa tạo (đợi 300ms sau khi ngừng gõ mới cập nhật chữ)
  const debouncedQuery = useDebounce(query, 300);

  // Xử lý click ra ngoài để đóng hộp gợi ý
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Gọi API khi debouncedQuery thay đổi
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await apiClient.get(
          `/api/features/search/suggest?q=${debouncedQuery}`,
        );
        setSuggestions(res.data);
      } catch (error) {
        console.error("Lỗi search suggest", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Submit bằng cách bấm Enter -> Sang trang Search nâng cao
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsFocused(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Click vào gợi ý -> Chuyển trang thẳng
  const handleSuggestionClick = (item) => {
    setIsFocused(false);
    setQuery(""); // Hoặc giữ nguyên text tùy UX bạn muốn
    if (item.type === "tag") {
      navigate(`/search?tag=${item.slug}`);
    } else {
      navigate(`/recipe/${item.slug}`);
    }
  };

  return (
    <div className="header-search-container" ref={searchRef}>
      <form
        className={`search-form ${isFocused ? "focused" : ""}`}
        onSubmit={handleSearchSubmit}
      >
        <div className="search-icon-wrapper">
          {isLoading ? (
            <Loader2 size={18} className="spinner" />
          ) : (
            <Search size={18} />
          )}
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm món ăn, nguyên liệu, thẻ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />

        {query && (
          <button
            type="button"
            className="btn-clear-search"
            onClick={() => setQuery("")}
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* DROPDOWN GỢI Ý (YOUTUBE STYLE) */}
      {isFocused && query && (
        <div className="search-dropdown animation-slide-down">
          {isLoading && suggestions.length === 0 ? (
            <div className="dropdown-message">Đang tìm kiếm...</div>
          ) : suggestions.length > 0 ? (
            <ul className="suggestion-list">
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(item)}
                >
                  <div className="suggestion-icon">
                    {item.type === "tag" ? (
                      <Hash size={16} color="var(--color-primary)" />
                    ) : (
                      <ChefHat size={16} color="var(--color-text-secondary)" />
                    )}
                  </div>
                  <div className="suggestion-text">
                    <span className="suggestion-title">{item.text}</span>
                    <span className="suggestion-type">
                      {item.type === "tag" ? "Thẻ (Tag)" : "Công thức"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="dropdown-message">
              Không tìm thấy kết quả phù hợp cho "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

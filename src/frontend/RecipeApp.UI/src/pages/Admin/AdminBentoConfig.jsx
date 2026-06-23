import React, { useState, useEffect } from "react";
import {
  Save,
  Settings,
  Flame,
  Award,
  Star,
  Coffee,
  Leaf,
  Megaphone,
  Hash,
  X,
  Plus,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import apiClient from "../../services/apiClient";
import "./AdminBentoConfig.css";

export const AdminBentoConfig = () => {
  const [config, setConfig] = useState({
    heroMode: "auto",
    heroRecipeId: "",
    sponsoredRecipeIds: "",
    chefMode: "auto",
    chefUserId: "",
    kitchenTip: "",
    challengeTitle: "",
    challengeDesc: "",
    challengeLink: "",
  });

  // STATES LƯU TRỮ DANH SÁCH TRA CỨU THẬT TỪ BACKEND
  const [recipesLookup, setRecipesLookup] = useState([]);
  const [chefsLookup, setChefsLookup] = useState([]);

  const [activeBlock, setActiveBlock] = useState("hero");
  const [isSaving, setIsSaving] = useState(false);
  const [challengesLookup, setChallengesLookup] = useState([]);

  useEffect(() => {
    // 1. Lấy cấu hình Bento cũ từ DB
    apiClient.get("/api/admin/bento-config-raw").then((res) => {
      if (res.data) setConfig(res.data);
    });

    // 2. Lấy danh sách công thức thật để chọn
    apiClient.get("/api/admin/recipes-lookup").then((res) => {
      setRecipesLookup(res.data);
    });

    // 3. Lấy danh sách đầu bếp thật để chọn
    apiClient.get("/api/admin/chefs-lookup").then((res) => {
      setChefsLookup(res.data);
    });
  }, []);

  useEffect(() => {
    apiClient.get("/api/admin/challenges-lookup").then((res) => {
      setChallengesLookup(res.data);
    });
  }, []);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  // XỬ LÝ BIẾN ĐỔI CHUỖI ID TÀI TRỢ THÀNH MẢNG ĐỂ DỄ HIỂN THỊ PILLS
  const getSponsoredArray = () => {
    if (!config.sponsoredRecipeIds) return [];
    return config.sponsoredRecipeIds
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");
  };

  // Thêm một món vào danh sách tài trợ thông qua Dropdown chọn lựa
  const handleAddSponsoredRecipe = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const currentArray = getSponsoredArray();
    if (!currentArray.includes(selectedId)) {
      const newIdsString =
        currentArray.length === 0
          ? selectedId
          : [...currentArray, selectedId].join(",");
      setConfig({ ...config, sponsoredRecipeIds: newIdsString });
    }
    e.target.value = ""; // Reset ô select về mặc định
  };

  // Xóa một món khỏi danh sách tài trợ
  const handleRemoveSponsoredRecipe = (idToRemove) => {
    const filteredArray = getSponsoredArray().filter((id) => id !== idToRemove);
    setConfig({ ...config, sponsoredRecipeIds: filteredArray.join(",") });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.post("/api/admin/bento-config", config);
      toast.success("Đã đồng bộ lưới Bento lên hệ thống!");
    } catch (error) {
      toast.error("Lỗi khi lưu cấu hình!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-page-wrapper animation-fade-in">
      <Toaster position="top-center" />

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Trình Kiến Tạo BentoGrid</h1>
          <p className="admin-page-subtitle">
            Chọn trực tiếp dữ liệu thực tế từ hệ thống để ghim lên trang chủ
          </p>
        </div>
        <button
          className="btn-admin-primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save size={18} /> {isSaving ? "Đang xử lý..." : "Lưu & Xuất bản"}
        </button>
      </div>

      <div className="bento-builder-layout">
        {/* CỘT TRÁI: BẢN ĐỒ LƯỚI WIREFRAME */}
        <div className="bento-wireframe-container">
          <div className="bento-wireframe-grid">
            <div
              className={`wire-block wire-hero ${activeBlock === "hero" ? "active" : ""}`}
              onClick={() => setActiveBlock("hero")}
            >
              <Flame size={24} /> <span>Món Nổi Bật</span>
              <div className="status-badge">{config.heroMode}</div>
            </div>

            <div className="wire-block wire-cat">
              <Coffee size={20} /> Khám phá
            </div>

            <div
              className={`wire-block wire-ad ${activeBlock === "sponsor" ? "active" : ""}`}
              onClick={() => setActiveBlock("sponsor")}
            >
              <Megaphone size={20} /> <span>Tài Trợ</span>
              {getSponsoredArray().length > 0 && (
                <div className="status-badge count">
                  {getSponsoredArray().length} món
                </div>
              )}
            </div>

            <div className="wire-block wire-trending">
              <Hash size={20} /> Từ khóa HOT
            </div>
            <div
              className={`wire-block wire-tip ${activeBlock === "tip" ? "active" : ""}`}
              onClick={() => setActiveBlock("tip")}
            >
              <Star size={20} /> Mẹo nhà bếp
            </div>

            <div
              className={`wire-block wire-chef ${activeBlock === "chef" ? "active" : ""}`}
              onClick={() => setActiveBlock("chef")}
            >
              <Award size={20} /> Top Đầu Bếp
              <div className="status-badge">{config.chefMode}</div>
            </div>

            <div
              className={`wire-block wire-challenge ${activeBlock === "challenge" ? "active" : ""}`}
              onClick={() => setActiveBlock("challenge")}
            >
              <Leaf size={20} /> Thử thách
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: FORM CHỈNH SỬA THÔNG MINH */}
        <div className="bento-editor-panel">
          <div className="editor-header">
            <Settings size={18} />
            <h3>Cấu hình: {activeBlock.toUpperCase()}</h3>
          </div>

          <div className="editor-body">
            {/* 1. CONFIG MÓN NỔI BẬT CHÍNH */}
            {activeBlock === "hero" && (
              <>
                <div className="form-group">
                  <label>Chế độ hiển thị</label>
                  <div className="radio-group-inline">
                    <label>
                      <input
                        type="radio"
                        name="heroMode"
                        value="auto"
                        checked={config.heroMode === "auto"}
                        onChange={handleChange}
                      />
                      Tự động (Lượt thích cao nhất)
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="heroMode"
                        value="manual"
                        checked={config.heroMode === "manual"}
                        onChange={handleChange}
                      />
                      Thủ công (Ghim bài viết chỉ định)
                    </label>
                  </div>
                </div>
                {config.heroMode === "manual" && (
                  <div className="form-group animation-slide-down">
                    <label>Chọn món ăn xuất sắc muốn ghim</label>
                    <select
                      name="heroRecipeId"
                      className="base-select"
                      value={config.heroRecipeId || ""}
                      onChange={handleChange}
                    >
                      <option value="">
                        -- Chọn công thức trong hệ thống --
                      </option>
                      {recipesLookup.map((r) => (
                        <option key={r.id} value={r.id}>
                          [#{r.id}] {r.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* 2. CONFIG MÓN QUẢNG CÁO TÀI TRỢ CHẠY DỌC (PRO MULTI-SELECT VISUAL) */}
            {activeBlock === "sponsor" && (
              <div className="form-group">
                <label>Thêm món vào hàng đợi Quảng cáo</label>
                <select
                  className="base-select"
                  onChange={handleAddSponsoredRecipe}
                  defaultValue=""
                >
                  <option value="">-- Chọn công thức cần quảng cáo --</option>
                  {recipesLookup.map((r) => (
                    <option key={r.id} value={r.id}>
                      [#{r.id}] {r.title}
                    </option>
                  ))}
                </select>

                <label style={{ marginTop: "20px", display: "block" }}>
                  Danh sách bài tài trợ hiện tại:
                </label>
                <div className="sponsored-pills-list">
                  {getSponsoredArray().map((id) => {
                    // Tìm tên món ăn thật từ danh sách lookup để render text thay vì số ID trần trụi
                    const matchedRecipe = recipesLookup.find(
                      (r) => r.id.toString() === id,
                    );
                    return (
                      <div key={id} className="sponsored-pill">
                        <span className="pill-text">
                          #{id} -{" "}
                          {matchedRecipe ? matchedRecipe.title : "Đang tải..."}
                        </span>
                        <button
                          type="button"
                          className="btn-remove-pill"
                          onClick={() => handleRemoveSponsoredRecipe(id)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                  {getSponsoredArray().length === 0 && (
                    <span className="text-muted">
                      Chưa ghim món nào. Hệ thống đang trống.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 3. CONFIG DANH VỊ ĐẦU BẾP */}
            {activeBlock === "chef" && (
              <>
                <div className="form-group">
                  <label>Chế độ vinh danh</label>
                  <div className="radio-group-inline">
                    <label>
                      <input
                        type="radio"
                        name="chefMode"
                        value="auto"
                        checked={config.chefMode === "auto"}
                        onChange={handleChange}
                      />{" "}
                      Tự động (Followers cao nhất)
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="chefMode"
                        value="manual"
                        checked={config.chefMode === "manual"}
                        onChange={handleChange}
                      />{" "}
                      Chỉ định thủ công
                    </label>
                  </div>
                </div>
                {config.chefMode === "manual" && (
                  <div className="form-group animation-slide-down">
                    <label>Chọn Đầu bếp danh tiếng</label>
                    <select
                      name="chefUserId"
                      className="base-select"
                      value={config.chefUserId || ""}
                      onChange={handleChange}
                    >
                      <option value="">-- Chọn tài khoản thành viên --</option>
                      {chefsLookup.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* 4. CONFIG MẸO VẶT & THỬ THÁCH (Giữ nguyên text input vì tính tùy biến tự viết) */}
            {activeBlock === "tip" && (
              <div className="form-group">
                <label>Nội dung mẹo vặt nhà bếp</label>
                <textarea
                  name="kitchenTip"
                  rows="4"
                  className="base-textarea"
                  value={config.kitchenTip}
                  onChange={handleChange}
                />
              </div>
            )}

            {activeBlock === "challenge" && (
              <>
                <div className="form-group">
                  <label>Chế độ hiển thị sự kiện trên ô Bento</label>
                  <div className="radio-group-inline">
                    <label>
                      <input
                        type="radio"
                        name="challengeMode"
                        value="auto"
                        checked={config.challengeMode === "auto"}
                        onChange={handleChange}
                      />
                      Tự động (Lấy cuộc thi Active mới nhất đang diễn ra)
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="challengeMode"
                        value="manual"
                        checked={config.challengeMode === "manual"}
                        onChange={handleChange}
                      />
                      Thủ công (Chỉ định ghim một sự kiện lớn)
                    </label>
                  </div>
                </div>

                {config.challengeMode === "manual" && (
                  <div className="form-group animation-slide-down">
                    <label>Chọn cuộc thi muốn ghim tiêu điểm</label>
                    <select
                      name="challengeId"
                      className="base-select"
                      value={config.challengeId || ""}
                      onChange={handleChange}
                    >
                      <option value="">
                        -- Chọn sự kiện trong hệ thống --
                      </option>
                      {challengesLookup.map((c) => (
                        <option key={c.id} value={c.id}>
                          [#{c.id}] {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

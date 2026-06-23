import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Calendar,
  Users,
  ShieldAlert,
  Award,
  ChevronRight,
  Hash,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import apiClient from "../../services/apiClient";
import { authUtils } from "../../utils/authUtils";
import "./ChallengePage.css";

// Hàm format ngày tháng chuẩn Việt Nam
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const ChallengePage = () => {
  const navigate = useNavigate();
  const [challengeInfo, setChallengeInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = authUtils.isLoggedIn();

  useEffect(() => {
    // Gọi API lấy dữ liệu Live Bento để bóc tách thông tin Thử thách
    apiClient
      .get("/api/Admin/bento-data")
      .then((res) => {
        setChallengeInfo(res.data.challenge);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleJoinChallenge = () => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để tham gia sự kiện!");
      return;
    }
    toast.success(
      `Sẵn sàng! Hãy nhớ gán tag #${challengeInfo.tagName} vào bài viết của bạn nhé!`,
      { duration: 4000 },
    );
    // Chuyển hướng sang trang viết công thức sau 1.5s
    setTimeout(() => navigate("/recipe-writer"), 1500);
  };

  if (isLoading)
    return (
      <div className="challenge-loading">
        Đang tải thông tin sự kiện ẩm thực...
      </div>
    );

  if (!challengeInfo || !challengeInfo.title)
    return (
      <div className="challenge-loading">
        Hiện tại chưa có sự kiện nào đang diễn ra. Hãy quay lại sau nhé!
      </div>
    );

  return (
    <div className="challenge-page-wrapper animation-fade-in">
      <Toaster position="top-center" />

      {/* BANNER ĐỈNH SỰ KIỆN */}
      <div className="challenge-hero-card">
        <div className="hero-gradient-overlay"></div>
        <div className="hero-badge">
          <Trophy size={16} /> Sự kiện tuần này
        </div>
        <h1 className="hero-title">{challengeInfo.title}</h1>
        <p className="hero-desc">{challengeInfo.desc}</p>

        <div className="hero-meta-row">
          {/* HIỂN THỊ DỮ LIỆU THẬT */}
          <span className="meta-item">
            <Calendar size={16} color="#f59e0b" />
            Thời gian: {formatDate(challengeInfo.startDate)} -{" "}
            {formatDate(challengeInfo.endDate)}
          </span>
          <span className="meta-item">
            <Users size={16} color="#10b981" />
            {challengeInfo.participantCount} Đầu bếp đã tham gia
          </span>
        </div>
      </div>

      <div className="challenge-content-layout">
        {/* CỘT TRÁI: THỂ LỆ & QUY ĐỊNH */}
        <div className="challenge-details-pane">
          <h2 className="pane-section-title">Thể lệ cuộc thi</h2>
          <ul className="rules-list">
            <li>
              <div className="rule-num">1</div>
              <p>
                Công thức món ăn đăng tải phải bám sát chủ đề{" "}
                <strong>{challengeInfo.title}</strong> do Ban tổ chức đưa ra.
              </p>
            </li>
            <li>
              <div className="rule-num">2</div>
              <p>
                Hình ảnh ảnh bìa, các bước làm phải rõ ràng, chính chủ, nghiêm
                cấm sao chép từ nguồn khác trên Internet.
              </p>
            </li>
            <li>
              <div className="rule-num">3</div>
              <p>
                Bài viết hợp lệ <strong>BẮT BUỘC</strong> phải có gắn kèm
                hashtag:
                <span
                  style={{
                    backgroundColor: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    marginLeft: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <Hash size={14} /> {challengeInfo.tagName}
                </span>
                <br />
                <span
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  (Nhập tag này vào ô Thẻ trong quá trình Viết bài và ấn Enter)
                </span>
              </p>
            </li>
          </ul>

          <div className="prize-box">
            <Award size={24} color="#f59e0b" />
            <div>
              <h4>Phần thưởng giải nhất</h4>
              <p>
                Huy hiệu độc quyền "Vua Đầu Bếp" ghim thẳng vào trang hồ sơ cá
                nhân và quà tặng hiện vật từ nhà tài trợ của nền tảng.
              </p>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: HÀNH ĐỘNG ĐĂNG KÝ */}
        <div className="challenge-action-pane">
          <div className="action-card-sticky">
            <h3>Sẵn sàng thử tài?</h3>
            <p>
              Trổ tài nấu nướng, chia sẻ hương vị độc đáo của bạn đến mọi người
              và giành lấy những danh hiệu cao quý nhất.
            </p>

            <button className="btn-join-event" onClick={handleJoinChallenge}>
              Tham gia thử thách ngay <ChevronRight size={16} />
            </button>

            <div className="security-notice">
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>
                Hệ thống tự động ghi nhận bài thi thông qua Hashtag. Bài viết vi
                phạm bản quyền sẽ bị loại khỏi bảng xếp hạng.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

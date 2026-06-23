import React, { useState, useEffect } from "react";
import {
  Users,
  ChefHat,
  MessageSquare,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import apiClient from "../../services/apiClient";
import "./AdminDashboard.css";

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecipes: 0,
    totalComments: 0,
    activeSponsors: 0,
    recentRecipes: [],
    categoryBreakdown: [],
  });
  const chartData = stats.interactionChart || [];
  const maxInteraction = Math.max(...chartData.map((d) => d.count), 1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/api/admin/dashboard/overview");
      setStats(res.data);
    } catch (error) {
      console.error("Lỗi tải thông số tổng quan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ==============================================================
  // TÍNH TOÁN TOÁN HỌC CHO BIỂU ĐỒ DONUT (DỰA TRÊN DỮ LIỆU THẬT)
  // ==============================================================
  const totalCatCount = stats.categoryBreakdown.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  // Màu sắc quy định cho Top 3 danh mục
  const colors = ["var(--color-primary)", "#3b82f6", "#10b981"];
  let accumulatedPercent = 0; // Tích lũy phần trăm để xác định điểm bắt đầu vẽ vòng tròn

  const donutSegments = stats.categoryBreakdown.map((cat, index) => {
    // Tính phần trăm chiếm dụng
    const percent =
      totalCatCount === 0 ? 0 : Math.round((cat.count / totalCatCount) * 100);

    // SVG Circle Stroke Dash Offset = Điểm bắt đầu (100 - phần trăm tích lũy + 25 độ dời)
    const strokeDashoffset = 100 - accumulatedPercent + 25;
    accumulatedPercent += percent;

    return {
      name: cat.name,
      percent: percent,
      color: colors[index],
      dashArray: `${percent} ${100 - percent}`,
      dashOffset: strokeDashoffset,
    };
  });

  const getCoordinates = () => {
    if (chartData.length === 0) return "";
    const xStep = 500 / (chartData.length - 1); // Khoảng cách giữa các cột
    const points = chartData.map((data, index) => {
      const x = 50 + index * xStep;
      // Tính Y dựa trên tỷ lệ phần trăm so với max (Đảo ngược vì tọa độ Y của SVG đi từ trên xuống)
      const y = 160 - (data.count / maxInteraction) * 120;
      return `${x},${y}`;
    });

    // Nối các điểm lại bằng lệnh L (LineTo) của SVG
    const pathD =
      `M ${points[0]} ` +
      points
        .slice(1)
        .map((p) => `L ${p}`)
        .join(" ");

    // Đường path đổ bóng phía dưới (Kéo xuống đáy L 550 200 L 50 200 Z)
    const shadowD = pathD + ` L 550 200 L 50 200 Z`;

    return { pathD, shadowD };
  };

  const dynamicPath = getCoordinates();
  return (
    <div className="admin-dashboard-wrapper">
      <div className="dashboard-hero-section">
        <div>
          <h1 className="dashboard-title">Tổng quan vận hành</h1>
          <p className="dashboard-subtitle">
            Số liệu phân tích hệ thống thời gian thực
          </p>
        </div>
        <button
          className="btn-refresh"
          onClick={fetchDashboardData}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? "spinning" : ""} /> Làm
          mới dữ liệu
        </button>
      </div>

      {/* 1. LƯỚI KPI */}
      <div className="kpi-grid">
        <div className="kpi-card ripple-effect">
          <div className="kpi-header">
            <div className="kpi-icon-box users">
              <Users size={22} />
            </div>
          </div>
          <div className="kpi-body">
            <h3 className="kpi-value">
              {isLoading ? "..." : stats.totalUsers}
            </h3>
            <span className="kpi-label">Tổng thành viên</span>
          </div>
        </div>

        <div className="kpi-card ripple-effect">
          <div className="kpi-header">
            <div className="kpi-icon-box recipes">
              <ChefHat size={22} />
            </div>
          </div>
          <div className="kpi-body">
            <h3 className="kpi-value">
              {isLoading ? "..." : stats.totalRecipes}
            </h3>
            <span className="kpi-label">Công thức nấu ăn</span>
          </div>
        </div>

        <div className="kpi-card ripple-effect">
          <div className="kpi-header">
            <div className="kpi-icon-box comments">
              <MessageSquare size={22} />
            </div>
          </div>
          <div className="kpi-body">
            <h3 className="kpi-value">
              {isLoading ? "..." : stats.totalComments}
            </h3>
            <span className="kpi-label">Thảo luận / Bình luận</span>
          </div>
        </div>

        <div className="kpi-card ripple-effect">
          <div className="kpi-header">
            <div className="kpi-icon-box sponsors">
              <ShieldCheck size={22} />
            </div>
          </div>
          <div className="kpi-body">
            <h3 className="kpi-value">
              {isLoading ? "..." : stats.activeSponsors}
            </h3>
            <span className="kpi-label">Chiến dịch tài trợ</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-row">
        {/* BIỂU ĐỒ 1: MOCKUP TẦN SUẤT (Vì cần lưu log truy cập hàng ngày mới làm thật được) */}
        <div className="chart-card large-chart animation-fade-in">
          <h3 className="chart-card-title">
            Tần suất tương tác hệ thống (7 ngày qua)
          </h3>
          <div className="chart-body-mock">
            {/* Giữ nguyên SVG Mock biểu đồ Line ở đây */}
            <svg viewBox="0 0 600 200" className="svg-line-chart">
              <line
                x1="0"
                y1="50"
                x2="600"
                y2="50"
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="100"
                x2="600"
                y2="100"
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="150"
                x2="600"
                y2="150"
                stroke="#f1f5f9"
                strokeWidth="1"
              />

              {dynamicPath && (
                <>
                  <path
                    d={dynamicPath.pathD}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="3"
                    className="animated-chart-path"
                  />
                  <path
                    d={dynamicPath.shadowD}
                    fill="url(#chart-gradient)"
                    opacity="0.15"
                  />
                </>
              )}
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="white" />
                </linearGradient>
              </defs>
            </svg>
            <div className="chart-x-axis">
              {chartData.map((d, idx) => (
                <span key={idx}>{d.dateLabel}</span>
              ))}
            </div>
          </div>
        </div>

        {/* BIỂU ĐỒ 2: CƠ CẤU DANH MỤC THẬT (REAL DONUT CHART) */}
        <div
          className="chart-card small-chart animation-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <h3 className="chart-card-title">Top 3 Danh mục</h3>
          <div className="chart-body-mock donut-center">
            <svg
              width="160"
              height="160"
              viewBox="0 0 42 42"
              className="donut-svg"
            >
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke="#e2e8f0"
                strokeWidth="4"
              ></circle>
              {donutSegments.map((seg, idx) => (
                <circle
                  key={idx}
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="4"
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  className="donut-segment"
                ></circle>
              ))}
            </svg>
            <div className="donut-legend">
              {donutSegments.map((seg, idx) => (
                <div
                  key={idx}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span
                    className="dot"
                    style={{ backgroundColor: seg.color }}
                  ></span>
                  {seg.name} ({seg.percent}%)
                </div>
              ))}
              {donutSegments.length === 0 && (
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                  Chưa có dữ liệu
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. BẢNG DỮ LIỆU THẬT: NHẬT KÝ BÀI VIẾT MỚI NHẤT */}
      <div className="dashboard-table-card">
        <h3 className="chart-card-title" style={{ padding: "20px 24px 0" }}>
          Công thức vừa được đăng tải
        </h3>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên công thức</th>
                <th>Tác giả</th>
                <th>Ngày đăng</th>
                <th>Lượt thích</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentRecipes.length > 0 ? (
                stats.recentRecipes.map((recipe) => (
                  <tr key={recipe.id}>
                    <td style={{ color: "#94a3b8" }}>#{recipe.id}</td>
                    <td>
                      <strong>{recipe.title}</strong>
                    </td>
                    <td>{recipe.authorName}</td>
                    <td>{formatDate(recipe.createdAt)}</td>
                    <td>{recipe.favoriteCount}</td>
                    <td>
                      {recipe.isDeleted ? (
                        <span className="badge status-locked">Đã khóa</span>
                      ) : (
                        <span className="badge status-active">Hiển thị</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", color: "#94a3b8" }}
                  >
                    Chưa có bài viết nào trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Calendar, Target, Award } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import apiClient from "../../services/apiClient";
import "./AdminTableStyle.css";
import "./AdminCreative.css";

export const AdminChallengeManagement = () => {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    title: "",
    description: "",
    tagName: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 7))
      .toISOString()
      .split("T")[0],
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchChallenges = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/api/admin/challenges");
      setChallenges(res.data);
    } catch {
      toast.error("Lỗi khi tải dữ liệu sự kiện.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description,
      tagName: item.tagName,
      startDate: item.startDate.split("T")[0],
      endDate: item.endDate.split("T")[0],
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/api/admin/challenges/${editingId}`, formData);
        toast.success("Cập nhật thử thách thành công!");
      } else {
        await apiClient.post("/api/admin/challenges", formData);
        toast.success("Đã tạo thử thách tuần mới!");
      }
      setIsModalOpen(false);
      fetchChallenges();
    } catch {
      toast.error("Lỗi thao tác xử lý dữ liệu!");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await apiClient.put(`/api/admin/challenges/${id}/status`, {
        isActive: !currentStatus,
      });
      setChallenges(
        challenges.map((c) =>
          c.id === id ? { ...c, isActive: !currentStatus } : c,
        ),
      );
      toast.success("Đã cập nhật trạng thái hoạt động!");
    } catch {
      toast.error("Lỗi hệ thống!");
    }
  };

  const getTimelineStatus = (item) => {
    if (!item.isActive)
      return <span className="badge status-locked">Đang đóng</span>;
    const now = new Date();
    if (now < new Date(item.startDate))
      return (
        <span
          className="badge"
          style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}
        >
          Sắp mở
        </span>
      );
    if (now > new Date(item.endDate))
      return (
        <span
          className="badge"
          style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
        >
          Hết hạn
        </span>
      );
    return <span className="badge status-active">Đang diễn ra</span>;
  };

  return (
    <div className="admin-page-wrapper animation-fade-in">
      <Toaster position="top-center" />
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản Lý Thử Thách Tuần</h1>
          <p className="admin-page-subtitle">
            Kiến tạo các sự kiện thi đua nấu nướng tăng tương tác cộng đồng
          </p>
        </div>
        <button className="btn-admin-primary" onClick={openAddModal}>
          <Plus size={18} /> Tạo thử thách mới
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted">Đang truy vấn kho sự kiện...</p>
      ) : (
        <div className="moderation-grid">
          {challenges.map((item) => (
            <div
              key={item.id}
              className={`mod-card ${!item.isActive ? "locked" : ""}`}
            >
              <div className="mod-card-header">
                <span
                  className="mod-author"
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Target size={14} /> #{item.tagName}
                </span>
                <label className="ios-toggle">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={() => handleToggleStatus(item.id, item.isActive)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="mod-card-body" style={{ minHeight: "110px" }}>
                <h3
                  className="mod-title"
                  style={{ fontSize: "18px", fontWeight: "800" }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    margin: "8px 0",
                  }}
                >
                  {item.description}
                </p>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "12px",
                  }}
                >
                  <Calendar size={12} />{" "}
                  {new Date(item.startDate).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(item.endDate).toLocaleDateString("vi-VN")}
                </div>
              </div>
              <div
                className="mod-stats"
                style={{
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "12px",
                  marginTop: "12px",
                }}
              >
                {getTimelineStatus(item)}
                <div className="tag-actions">
                  <button onClick={() => openEditModal(item)}>
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="delete"
                    onClick={() => {
                      if (window.confirm("Xóa sự kiện này?"))
                        apiClient
                          .delete(`/api/admin/challenges/${item.id}`)
                          .then(() => fetchChallenges());
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORM TẠO/SỬA CHALLENGE */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal animation-slide-down">
            <div className="modal-header">
              <h3>Cấu hình sự kiện thử thách</h3>
              <button
                className="btn-close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên cuộc thi / Thử thách</label>
                  <input
                    required
                    className="base-input"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="VD: Sáng tạo cùng Món Cuốn"
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả chi tiết và Thể lệ</label>
                  <textarea
                    required
                    rows="4"
                    className="base-textarea"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Nêu rõ cách thức tham gia và phần quà thưởng..."
                  />
                </div>
                <div className="form-group">
                  <label>Hashtag định danh bài nộp (TagName)</label>
                  <input
                    required
                    className="base-input"
                    value={formData.tagName}
                    onChange={(e) =>
                      setFormData({ ...formData, tagName: e.target.value })
                    }
                    placeholder="VD: thuthach-moncuon (Không dấu, không khoảng trắng)"
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div className="form-group">
                    <label>Ngày bắt đầu</label>
                    <input
                      type="date"
                      className="base-input"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày kết thúc</label>
                    <input
                      type="date"
                      className="base-input"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-admin-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-admin-primary">
                  Lưu thử thách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

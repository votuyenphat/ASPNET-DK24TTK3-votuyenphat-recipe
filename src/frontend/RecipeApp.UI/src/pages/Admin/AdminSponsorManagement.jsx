import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import apiClient from "../../services/apiClient";
import "./AdminTableStyle.css";
import "./AdminCreative.css"; // Dùng cho iOS Toggle

export const AdminSponsorManagement = () => {
  const [sponsors, setSponsors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Dữ liệu form mặc định
  const initialForm = {
    title: "",
    brandName: "",
    imageUrl: "",
    targetUrl: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 7))
      .toISOString()
      .split("T")[0],
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchSponsors = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/api/admin/sponsors");
      setSponsors(res.data);
    } catch (error) {
      toast.error("Lỗi tải danh sách chiến dịch");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (sponsor) => {
    setEditingId(sponsor.id);
    setFormData({
      title: sponsor.title,
      brandName: sponsor.brandName,
      imageUrl: sponsor.imageUrl,
      targetUrl: sponsor.targetUrl,
      startDate: sponsor.startDate.split("T")[0],
      endDate: sponsor.endDate.split("T")[0],
      isActive: sponsor.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/api/admin/sponsors/${editingId}`, formData);
        toast.success("Đã cập nhật chiến dịch!");
      } else {
        await apiClient.post("/api/admin/sponsors", formData);
        toast.success("Tạo chiến dịch mới thành công!");
      }
      setIsModalOpen(false);
      fetchSponsors();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu!");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await apiClient.put(`/api/admin/sponsors/${id}/status`, {
        isActive: !currentStatus,
      });
      setSponsors(
        sponsors.map((s) =>
          s.id === id ? { ...s, isActive: !currentStatus } : s,
        ),
      );
      toast.success(
        !currentStatus ? "Đã bật chiến dịch" : "Đã tạm dừng chiến dịch",
      );
    } catch (error) {
      toast.error("Lỗi thao tác!");
    }
  };

  const handleDelete = async (id, title) => {
    if (
      !window.confirm(`Bạn có chắc muốn xóa vĩnh viễn chiến dịch "${title}"?`)
    )
      return;
    try {
      await apiClient.delete(`/api/admin/sponsors/${id}`);
      toast.success("Đã xóa chiến dịch!");
      fetchSponsors();
    } catch (error) {
      toast.error("Không thể xóa!");
    }
  };

  // Hàm helper tính toán trạng thái thời gian thực
  const getStatusBadge = (sponsor) => {
    if (!sponsor.isActive)
      return <span className="badge status-locked">Tạm dừng</span>;
    const now = new Date();
    const start = new Date(sponsor.startDate);
    const end = new Date(sponsor.endDate);

    if (now < start)
      return (
        <span
          className="badge"
          style={{ backgroundColor: "#fef9c3", color: "#0369a1" }}
        >
          Sắp diễn ra
        </span>
      );
    if (now > end)
      return (
        <span
          className="badge"
          style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
        >
          Đã kết thúc
        </span>
      );
    return <span className="badge status-active">Đang chạy</span>;
  };

  const filteredSponsors = sponsors.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.brandName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="admin-page-wrapper animation-fade-in">
      <Toaster position="top-center" />

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Tài trợ & Quảng cáo</h1>
          <p className="admin-page-subtitle">
            Quản lý các banner thương hiệu xuất hiện trên trang chủ
          </p>
        </div>
        <button className="btn-admin-primary" onClick={openAddModal}>
          <Plus size={18} /> Tạo chiến dịch
        </button>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <div className="admin-search-box">
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Tìm tên chiến dịch hoặc thương hiệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th width="35%">Thông tin chiến dịch</th>
                <th width="20%">Thời gian chạy</th>
                <th width="15%">Trạng thái</th>
                <th width="15%">Bật/Tắt</th>
                <th width="15%" style={{ textAlign: "right" }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredSponsors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    Chưa có chiến dịch nào.
                  </td>
                </tr>
              ) : (
                filteredSponsors.map((sponsor) => (
                  <tr key={sponsor.id}>
                    {/* Cột 1: Thông tin ảnh và tiêu đề */}
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "80px",
                            height: "48px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            backgroundColor: "#f1f5f9",
                            flexShrink: 0,
                          }}
                        >
                          {sponsor.imageUrl ? (
                            <img
                              src={sponsor.imageUrl}
                              alt={sponsor.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                height: "100%",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ImageIcon size={20} color="#94a3b8" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: "bold",
                              color: "#0f172a",
                              marginBottom: "4px",
                            }}
                          >
                            {sponsor.title}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              display: "flex",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: "bold",
                                color: "var(--color-primary)",
                              }}
                            >
                              {sponsor.brandName}
                            </span>
                            {sponsor.targetUrl && (
                              <a
                                href={sponsor.targetUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  color: "#3b82f6",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}
                              >
                                <LinkIcon size={12} /> Link
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Thời gian */}
                    <td>
                      <div style={{ fontSize: "13px", color: "#334155" }}>
                        <div>
                          Từ:{" "}
                          <strong>
                            {new Date(sponsor.startDate).toLocaleDateString(
                              "vi-VN",
                            )}
                          </strong>
                        </div>
                        <div style={{ marginTop: "4px" }}>
                          Đến:{" "}
                          <strong>
                            {new Date(sponsor.endDate).toLocaleDateString(
                              "vi-VN",
                            )}
                          </strong>
                        </div>
                      </div>
                    </td>

                    {/* Cột 3: Trạng thái thời gian thực */}
                    <td>{getStatusBadge(sponsor)}</td>

                    {/* Cột 4: Nút Gạt iOS */}
                    <td>
                      <label className="ios-toggle">
                        <input
                          type="checkbox"
                          checked={sponsor.isActive}
                          onChange={() =>
                            handleToggleStatus(sponsor.id, sponsor.isActive)
                          }
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </td>

                    {/* Cột 5: Thao tác */}
                    <td className="actions-cell">
                      <button
                        className="btn-icon edit"
                        onClick={() => openEditModal(sponsor)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(sponsor.id, sponsor.title)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM/SỬA */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div
            className="admin-modal animation-slide-down"
            style={{ maxWidth: "600px" }}
          >
            <div className="modal-header">
              <h3>
                {editingId
                  ? "Cập nhật chiến dịch"
                  : "Khởi tạo chiến dịch tài trợ"}
              </h3>
              <button
                className="btn-close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div
                className="modal-body"
                style={{ maxHeight: "60vh", overflowY: "auto" }}
              >
                <div className="form-group">
                  <label>Tiêu đề chiến dịch</label>
                  <input
                    required
                    className="base-input"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="VD: Khuyến mãi gia vị bếp"
                  />
                </div>
                <div className="form-group">
                  <label>Tên Thương hiệu</label>
                  <input
                    required
                    className="base-input"
                    value={formData.brandName}
                    onChange={(e) =>
                      setFormData({ ...formData, brandName: e.target.value })
                    }
                    placeholder="VD: Maggi, Chinsu..."
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
                      required
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
                      required
                      className="base-input"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Đường dẫn hình ảnh (Banner URL)</label>
                  <input
                    required
                    type="url"
                    className="base-input"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginTop: "8px",
                      }}
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Đường dẫn đích (URL khi user click)</label>
                  <input
                    type="url"
                    className="base-input"
                    value={formData.targetUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, targetUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div
                  className="form-group"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: "8px",
                  }}
                >
                  <label style={{ margin: 0 }}>
                    Cho phép chạy ngay (Active)
                  </label>
                  <label className="ios-toggle">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
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
                  Lưu chiến dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

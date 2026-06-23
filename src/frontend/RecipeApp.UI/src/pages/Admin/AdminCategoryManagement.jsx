import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import apiClient from "../../services/apiClient";
import "./AdminTableStyle.css"; // Dùng chung CSS cho các bảng Admin

export const AdminCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // States cho Form (Thêm/Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "" });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/api/admin/categories");
      setCategories(res.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Lọc dữ liệu trên FE cho nhanh
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingId) {
        await apiClient.put(`/api/admin/categories/${editingId}`, formData);
        toast.success("Đã cập nhật danh mục!");
      } else {
        await apiClient.post("/api/admin/categories", formData);
        toast.success("Đã thêm danh mục mới!");
      }
      setIsModalOpen(false);
      fetchCategories(); // Reload data
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa danh mục "${name}"? Thao tác này sẽ bị chặn nếu danh mục đang chứa công thức.`,
      )
    )
      return;

    try {
      await apiClient.delete(`/api/admin/categories/${id}`);
      toast.success("Xóa thành công!");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa!");
    }
  };

  return (
    <div className="admin-page-wrapper animation-fade-in">
      <Toaster position="top-center" />

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý danh mục</h1>
          <p className="admin-page-subtitle">
            Thêm, sửa, xóa các nhóm phân loại công thức
          </p>
        </div>
        <button className="btn-admin-primary" onClick={openAddModal}>
          <Plus size={18} /> Thêm danh mục mới
        </button>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <div className="admin-search-box">
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th width="10%">ID</th>
                <th width="40%">Tên danh mục</th>
                <th width="35%">Đường dẫn (Slug)</th>
                <th width="15%" style={{ textAlign: "right" }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    Không tìm thấy danh mục nào.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="text-muted">#{cat.id}</td>
                    <td>
                      <strong>{cat.name}</strong>
                    </td>
                    <td className="text-muted">{cat.slug}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-icon edit"
                        onClick={() => openEditModal(cat)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(cat.id, cat.name)}
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

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal animation-slide-down">
            <div className="modal-header">
              <h3>{editingId ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h3>
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
                  <label>Tên danh mục</label>
                  <input
                    type="text"
                    className="base-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    placeholder="VD: Món chay, Ăn vặt..."
                    autoFocus
                    required
                  />
                  <small
                    style={{
                      color: "#64748b",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    Đường dẫn (Slug) sẽ tự động sinh dựa trên tên.
                  </small>
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
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

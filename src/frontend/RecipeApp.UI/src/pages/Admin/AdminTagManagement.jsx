import React, { useState, useEffect } from "react";
import { Hash, Trash2, Edit3, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";
import "./AdminCreative.css"; // File CSS chung cho giao diện Pro

export const AdminTagManagement = () => {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Trạng thái Inline Edit
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/api/admin/tags");
      setTags(res.data);
    } catch (error) {
      toast.error("Lỗi tải Tags");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleSaveInline = async (id) => {
    if (!editValue.trim()) return setEditingId(null);
    try {
      await apiClient.put(`/api/admin/tags/${id}`, { name: editValue });
      toast.success("Đã cập nhật tên thẻ!");
      setTags(tags.map((t) => (t.id === id ? { ...t, name: editValue } : t)));
      setEditingId(null);
    } catch (error) {
      toast.error("Lỗi cập nhật!");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa thẻ #${name}?`)) return;
    try {
      await apiClient.delete(`/api/admin/tags/${id}`);
      setTags(tags.filter((t) => t.id !== id));
      toast.success("Đã bay màu thẻ!");
    } catch (error) {
      toast.error("Lỗi khi xóa!");
    }
  };

  // Tính toán màu sắc dựa trên độ Hot (Nhiều recipe = màu đậm)
  const maxCount = Math.max(...tags.map((t) => t.recipeCount), 1);

  return (
    <div className="admin-page-wrapper animation-fade-in">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Hệ Sinh Thái Thẻ (Tags)</h1>
          <p className="admin-page-subtitle">
            Quản lý từ khóa thông minh bằng thao tác trực tiếp
          </p>
        </div>
      </div>

      <div className="tag-cloud-container">
        {isLoading ? (
          <p className="text-muted">Đang tải dữ liệu hạt nhân...</p>
        ) : (
          tags.map((tag) => {
            // Tính toán độ đậm (Opacity) từ 0.2 đến 1.0
            const heatOpacity = Math.max(0.2, tag.recipeCount / maxCount);
            const isEditing = editingId === tag.id;

            return (
              <div key={tag.id} className="tag-node-card">
                <div
                  className="tag-heat-bar"
                  style={{ opacity: heatOpacity }}
                ></div>

                <div className="tag-node-content">
                  <Hash size={16} color="var(--color-primary)" />
                  {isEditing ? (
                    <div className="inline-edit-box">
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSaveInline(tag.id)
                        }
                      />
                      <button
                        onClick={() => handleSaveInline(tag.id)}
                        className="btn-ok"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <span
                      className="tag-name"
                      onDoubleClick={() => {
                        setEditingId(tag.id);
                        setEditValue(tag.name);
                      }}
                    >
                      {tag.name}
                    </span>
                  )}
                </div>

                <div className="tag-node-footer">
                  <span className="tag-count">{tag.recipeCount} bài viết</span>
                  {!isEditing && (
                    <div className="tag-actions">
                      <button
                        onClick={() => {
                          setEditingId(tag.id);
                          setEditValue(tag.name);
                        }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="delete"
                        onClick={() => handleDelete(tag.id, tag.name)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

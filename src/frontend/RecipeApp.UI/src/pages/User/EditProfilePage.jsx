import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { Camera, ImagePlus, Save, ArrowLeft } from "lucide-react";
import apiClient from "../../services/apiClient";
import "./EditProfilePage.css";
import { useNavigate } from "react-router-dom";
import { authUtils } from "../../utils/authUtils";

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      displayName: "",
      bio: "",
      avatarUrl: "",
      coverUrl: "",
    },
  });

  // Load dữ liệu cũ khi vừa vào trang
  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res = await apiClient.get("/api/features/users/me");
        reset({
          displayName: res.data.displayName || "",
          bio: res.data.bio || "",
          avatarUrl: res.data.avatarUrl || "",
          coverUrl: res.data.coverUrl || "",
        });
      } catch (error) {
        toast.error("Không thể tải thông tin hồ sơ.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyProfile();
  }, [reset]);

  // Tái sử dụng logic Upload Ảnh
  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    const loadingToast = toast.loading("Đang tải ảnh lên...");

    try {
      const res = await apiClient.post(
        "/api/features/uploads/image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setValue(fieldName, res.data.url); // Set link ảnh vào form
      toast.success("Tải ảnh thành công!", { id: loadingToast });
    } catch (error) {
      toast.error("Lỗi tải ảnh.", { id: loadingToast });
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading("Đang lưu thay đổi...");

    try {
      const res = await apiClient.put("/api/features/users/me", data);

      // CẬP NHẬT LẠI LOCALSTORAGE ĐỂ NAVBAR/HEADER THAY ĐỔI THEO
      const currentUserInfo = authUtils.getUserInfo();
      const token = localStorage.getItem("recipe_app_token");
      authUtils.setAuthData(token, {
        ...currentUserInfo,
        displayName: res.data.user.displayName,
        avatarUrl: res.data.user.avatarUrl,
      });

      toast.success("Hồ sơ đã được cập nhật!", { id: loadingToast });
      setTimeout(() => navigate("/profile"), 1000); // Quay về trang profile
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchAvatar = watch("avatarUrl");
  const watchCover = watch("coverUrl");

  if (isLoading)
    return <div className="loading-state">Đang tải dữ liệu...</div>;

  return (
    <div className="edit-profile-container">
      <Toaster position="top-center" />

      <div className="edit-profile-header">
        <button className="btn-back" onClick={() => navigate("/profile")}>
          <ArrowLeft size={20} /> Quay lại
        </button>
        <h2>Chỉnh sửa hồ sơ</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="edit-profile-form">
        {/* KHU VỰC ẢNH BÌA & AVATAR (Làm giống UI ProfilePage) */}
        <div className="profile-images-edit">
          <div className="cover-edit-zone">
            {watchCover ? (
              <img src={watchCover} alt="Cover" className="cover-img" />
            ) : (
              <div className="cover-placeholder">Chưa có ảnh bìa</div>
            )}
            <label className="btn-change-cover">
              <ImagePlus size={16} /> Đổi ảnh bìa
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "coverUrl")}
              />
            </label>
          </div>

          <div className="avatar-edit-zone">
            <div className="avatar-wrapper">
              <img
                src={watchAvatar || "https://ui-avatars.com/api/?name=User"}
                alt="Avatar"
                className="avatar-img"
              />
              <label className="btn-change-avatar">
                <Camera size={18} />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "avatarUrl")}
                />
              </label>
            </div>
          </div>
        </div>

        {/* KHU VỰC THÔNG TIN TEXT */}
        <div className="profile-info-edit">
          <div className="form-group">
            <label>
              Tên hiển thị <span className="required">*</span>
            </label>
            <input
              {...register("displayName", { required: true })}
              className="base-input"
              placeholder="VD: Siêu Đầu Bếp"
            />
          </div>

          <div className="form-group">
            <label>Tiểu sử (Bio)</label>
            <textarea
              {...register("bio")}
              className="base-textarea"
              rows="4"
              placeholder="Vài dòng giới thiệu về bạn và niềm đam mê nấu nướng..."
            />
          </div>
        </div>

        <div className="edit-profile-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/profile")}
          >
            Hủy
          </button>
          <button type="submit" className="btn-save" disabled={isSubmitting}>
            <Save size={18} /> {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services/authService";
import "./LoginForm.css";
import { FormField } from "../../atoms/molecules/FormField/FormField";
import { Button } from "../../atoms/Button/Button";
import { authUtils } from "../../../utils/authUtils";
import toast from "react-hot-toast";

export const LoginForm = () => {
  const navigate = useNavigate(); // Hook dùng để chuyển trang
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ.";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setIsLoading(true);
      setErrors({ ...errors, form: "" }); // Xóa lỗi form cũ nếu có

      try {
        // GỌI DỊCH VỤ ĐĂNG NHẬP THẬT
        const res = await authService.login(formData.email, formData.password);
        // console.log(res);
        // authUtils.setAuth(res.data.token, {
        //   id: res.data.userId,
        //   displayName: res.data.displayName,
        //   avatarUrl: res.data.avatarUrl,
        //   role: res.data.role, // <-- Nhận giá trị "Admin" hoặc "User" từ BE
        // });

        toast.success("Chào mừng quay trở lại!", { id: res.displayName });
        console.log(res);
        // LOGIC ĐIỀU HƯỚNG THÔNG MINH THEO QUYỀN
        if (res.role === "Admin") {
          navigate("/admin/dashboard"); // Nếu là Admin -> Vào thẳng trung tâm điều khiển
        } else {
          navigate("/"); // Người dùng thông thường -> Về trang chủ feed công thức
        }
      } catch (error) {
        // Hiển thị lỗi từ backend (sai pass, sai email...) lên giao diện
        setErrors({ ...errors, form: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">Đăng nhập</h2>

      {errors.form && (
        <div className="form-global-error animate-error">{errors.form}</div>
      )}

      <FormField
        name="email"
        label="Email"
        type="email"
        placeholder="ví dụ: user@cookpad.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <FormField
        name="password"
        label="Mật khẩu"
        type="password"
        placeholder="Nhập mật khẩu của bạn"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />

      <div className="form-actions">
        <Button type="submit" isLoading={isLoading}>
          Đăng nhập
        </Button>
      </div>
    </form>
  );
};

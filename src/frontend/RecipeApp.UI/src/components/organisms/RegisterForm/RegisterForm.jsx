import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../atoms/Button/Button';
import { authService } from '../../../services/authService';
import './RegisterForm.css';
import { FormField } from '../../atoms/molecules/FormField/FormField';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    displayName: '' 
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Vui lòng nhập tên hiển thị.';
    }

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ.';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsLoading(true);
      setErrors({ ...errors, form: '' }); 
      
      try {
        await authService.register(formData.email, formData.password, formData.displayName);
        // Đăng ký thành công, token đã được lưu, chuyển hướng về trang chủ
        navigate('/'); 
      } catch (error) {
        setErrors({ ...errors, form: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">Tạo tài khoản mới</h2>
      <p className="form-subtitle">Tham gia cộng đồng yêu ẩm thực lớn nhất</p>
      
      {errors.form && <div className="form-global-error animate-error">{errors.form}</div>}

      <FormField
        name="displayName"
        label="Tên hiển thị"
        type="text"
        placeholder="ví dụ: Châu Nguyễn Trường An"
        value={formData.displayName}
        onChange={handleChange}
        error={errors.displayName}
      />

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
        placeholder="Tối thiểu 6 ký tự"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />

      <div className="form-actions">
        <Button type="submit" isLoading={isLoading}>
          Đăng ký
        </Button>
      </div>
    </form>
  );
};
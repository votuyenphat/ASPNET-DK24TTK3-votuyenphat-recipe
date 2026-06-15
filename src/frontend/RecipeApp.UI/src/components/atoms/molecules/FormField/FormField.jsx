import React, { useState } from "react";
import "./FormField.css";

export const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  name,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordType = type === "password";

  // Chuyển đổi type giữa text và password
  const inputType = isPasswordType
    ? isPasswordVisible
      ? "text"
      : "password"
    : type;

  return (
    <div className="form-field-wrapper">
      <label className="field-label">{label}</label>

      <div className="input-container">
        <input
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`field-input ${error ? "input-error animate-shake" : ""}`}
        />

        {/* Nút bật/tắt mật khẩu */}
        {isPasswordType && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? "👁️" : "👁️‍🗨️"}{" "}
            {/* Tạm dùng emoji, bạn có thể thay bằng SVG icon */}
          </button>
        )}
      </div>

      {/* Thông báo lỗi với animation */}
      {error && <span className="field-error-msg animate-error">{error}</span>}
    </div>
  );
};

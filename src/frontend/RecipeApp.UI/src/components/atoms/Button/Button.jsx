import React from "react";
import "./Button.css";

export const Button = ({
  children,
  isLoading,
  onClick,
  type = "button",
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`btn-base ${className} ${isLoading ? "loading" : ""}`}
    >
      {isLoading ? "Đang xử lý..." : children}
    </button>
  );
};

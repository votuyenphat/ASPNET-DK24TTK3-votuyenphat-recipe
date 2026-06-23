import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import "./ConfirmModal.css";

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  isDestructive = true, // Đặt true nếu hành động nguy hiểm (Xóa) để bôi đỏ nút
}) => {
  // Tắt scroll body khi Modal mở
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          {/* Lớp nền đen mờ */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Hộp thoại Modal */}
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <button className="btn-close-modal" onClick={onCancel}>
              <X size={20} />
            </button>

            <div className="modal-header">
              <div
                className={`modal-icon ${isDestructive ? "danger" : "warning"}`}
              >
                <AlertTriangle size={24} />
              </div>
              <h3 className="modal-title">{title}</h3>
            </div>

            <div className="modal-body">
              <p>{message}</p>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={onCancel}>
                {cancelText}
              </button>
              <button
                className={`btn-modal-confirm ${isDestructive ? "btn-danger" : "btn-primary"}`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

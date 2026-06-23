import React, { useState } from "react";
import { CornerDownRight, Send } from "lucide-react";
import "./CommentSection.css";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 1. COMPONENT REPLY FORM: Tách riêng để chống giật trang
const ReplyForm = ({ commentAuthor, onSubmitReply, isSubmitting }) => {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // Chặn reload trang
    if (!content.trim() || isSubmitting) return;
    onSubmitReply(content);
    setContent("");
  };

  return (
    <div className="reply-input-box animation-slide-up">
      <CornerDownRight
        size={18}
        color="var(--color-text-hint)"
        className="reply-arrow"
      />
      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Trả lời ${commentAuthor}...`}
          rows="1"
          autoFocus
        />
        <button
          type="submit"
          className="btn-send-comment"
          disabled={!content.trim() || isSubmitting}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

// 2. COMPONENT ĐỆ QUY HIỂN THỊ COMMENT
const RenderCommentItem = ({
  comment,
  isReplyNode = false,
  replyingToId,
  setReplyingToId,
  handlePercentReply,
  isSubmitting,
  editingCommentId,
  setEditingCommentId,
  editContent,
  setEditContent,
  handleSaveEdit,
  handleDeleteComment,
  currentUserId,
}) => {
  const isEditing = editingCommentId === comment.id;

  return (
    <div className={`comment-node ${isReplyNode ? "reply-node" : ""}`}>
      <div className="comment-item">
        <img
          src={
            comment.authorAvatar ||
            `https://ui-avatars.com/api/?name=${comment.authorName}`
          }
          alt={comment.authorName}
          className="comment-avatar"
        />

        <div className="comment-content">
          <div className="comment-meta">
            <span className="comment-author">{comment.authorName}</span>
            <span className="comment-date">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {/* NẾU ĐANG SỬA THÌ HIỆN Ô INPUT, KHÔNG THÌ HIỆN TEXT */}
          {isEditing ? (
            <div className="edit-comment-box" style={{ marginTop: "8px" }}>
              <textarea
                className="base-textarea"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn-action-reply"
                  onClick={() => handleSaveEdit(comment.id)}
                  disabled={isSubmitting}
                >
                  Lưu
                </button>
                <button
                  className="btn-action-reply"
                  onClick={() => setEditingCommentId(null)}
                  style={{ color: "var(--color-error)" }}
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <p className="comment-text">{comment.content}</p>
          )}

          {/* Thanh hành động (Trả lời / Sửa / Xóa) */}
          <div className="comment-actions">
            {!isEditing && (
              <button
                type="button"
                className="btn-action-reply"
                onClick={() => {
                  setReplyingToId(
                    replyingToId === comment.id ? null : comment.id,
                  );
                  setEditingCommentId(null);
                }}
              >
                Trả lời
              </button>
            )}

            {!isEditing && currentUserId === comment.authorId && (
              <>
                <button
                  type="button"
                  className="btn-action-reply"
                  style={{ marginLeft: "12px" }}
                  onClick={() => {
                    setEditingCommentId(comment.id);
                    setEditContent(comment.content);
                    setReplyingToId(null);
                  }}
                >
                  Sửa
                </button>
                <button
                  type="button"
                  className="btn-action-reply"
                  style={{ marginLeft: "12px", color: "var(--color-error)" }}
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Xóa
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Gọi Form Trả lời */}
      {replyingToId === comment.id && (
        <ReplyForm
          commentAuthor={comment.authorName}
          isSubmitting={isSubmitting}
          onSubmitReply={(text) => handlePercentReply(text, comment.id)}
        />
      )}

      {/* ĐỆ QUY TỰ ĐỘNG CÙNG PROPS TRUYỀN XUỐNG */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-container">
          {comment.replies.map((reply) => (
            <RenderCommentItem
              key={reply.id}
              comment={reply}
              isReplyNode={true}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              handlePercentReply={handlePercentReply}
              isSubmitting={isSubmitting}
              editingCommentId={editingCommentId}
              setEditingCommentId={setEditingCommentId}
              editContent={editContent}
              setEditContent={setEditContent}
              handleSaveEdit={handleSaveEdit}
              handleDeleteComment={handleDeleteComment}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RenderCommentItem;

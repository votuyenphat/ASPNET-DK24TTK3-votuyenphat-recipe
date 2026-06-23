import React, { useState, useEffect } from "react";
import { MessageCircle, Send, UserCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../../services/apiClient";
import { authUtils } from "../../../utils/authUtils";
import "./CommentSection.css";
import RenderCommentItem from "./ReplyComment";

export const CommentSection = ({ recipeId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = authUtils.getUserInfo();
  const currentUserId = currentUser?.id;

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);

  const isLoggedIn = authUtils.isLoggedIn();

  const fetchComments = async () => {
    try {
      const res = await apiClient.get(
        `/api/features/interactions/recipes/${recipeId}/comments`,
      );
      setComments(res.data);
    } catch (error) {
      console.error("Lỗi lấy bình luận:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (recipeId) fetchComments();
  }, [recipeId]);

  // HÀM SỬA BÌNH LUẬN
  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) return;
    setIsSubmitting(true);
    try {
      await apiClient.put(`/api/features/interactions/comments/${commentId}`, {
        content: editContent,
      });

      const updateCommentContent = (commentList) => {
        return commentList.map((c) => {
          if (c.id === commentId) return { ...c, content: editContent };
          if (c.replies && c.replies.length > 0)
            return { ...c, replies: updateCommentContent(c.replies) };
          return c;
        });
      };

      setComments((prev) => updateCommentContent(prev));
      setEditingCommentId(null);
      toast.success("Đã cập nhật bình luận!");
    } catch (error) {
      toast.error("Lỗi khi cập nhật.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // HÀM XÓA BÌNH LUẬN TÍCH HỢP MỚI
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    setIsSubmitting(true);
    try {
      await apiClient.delete(
        `/api/features/interactions/comments/${commentId}`,
      );

      // Xóa bình luận khỏi cây hiển thị
      const removeComment = (commentList) => {
        return commentList
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies ? removeComment(c.replies) : [],
          }));
      };

      setComments((prev) => removeComment(prev));
      toast.success("Đã xóa bình luận!");
    } catch (error) {
      toast.error("Không thể xóa bình luận lúc này.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // GỬI BÌNH LUẬN MỚI
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    if (!isLoggedIn) return toast.error("Vui lòng đăng nhập để bình luận!");

    setIsSubmitting(true);
    try {
      const res = await apiClient.post(
        `/api/features/interactions/recipes/${recipeId}/comments`,
        {
          content: newComment,
          parentCommentId: null,
        },
      );
      setComments((prev) => [res.data, ...prev]);
      setNewComment("");
      toast.success("Đã gửi bình luận!");
    } catch (error) {
      toast.error("Không thể gửi bình luận.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // TRẢ LỜI BÌNH LUẬN
  const handlePercentReply = async (text, parentId) => {
    if (!text.trim() || isSubmitting) return;
    if (!isLoggedIn) return toast.error("Vui lòng đăng nhập để trả lời!");

    setIsSubmitting(true);
    try {
      const res = await apiClient.post(
        `/api/features/interactions/recipes/${recipeId}/comments`,
        {
          content: text,
          parentCommentId: parentId,
        },
      );

      const insertReply = (commentList) => {
        return commentList.map((c) => {
          if (c.id === parentId) {
            return { ...c, replies: [res.data, ...c.replies] };
          } else if (c.replies && c.replies.length > 0) {
            return { ...c, replies: insertReply(c.replies) };
          }
          return c;
        });
      };

      setComments((prev) => insertReply(prev));
      setReplyingToId(null);
      toast.success("Đã trả lời bình luận!");
    } catch (error) {
      toast.error("Lỗi khi gửi câu trả lời.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comment-section-wrapper">
      <div className="comment-header">
        <MessageCircle size={24} color="var(--color-primary)" />
        <h3>Bình luận</h3>
      </div>

      <div className="comment-input-box">
        <div className="avatar-placeholder">
          <UserCircle2 size={40} color="#cbd5e1" />
        </div>
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              isLoggedIn
                ? "Thêm bình luận của bạn về món ăn này..."
                : "Vui lòng đăng nhập để bình luận..."
            }
            rows="2"
            disabled={!isLoggedIn || isSubmitting}
          />
          <button
            type="submit"
            className="btn-send-comment-large"
            disabled={!newComment.trim() || !isLoggedIn || isSubmitting}
          >
            <Send size={16} /> Gửi bình luận
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="comments-loading">Đang tải thảo luận...</div>
      ) : comments.length === 0 ? (
        <div className="comments-empty">Chưa có thảo luận nào.</div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <RenderCommentItem
              key={comment.id}
              comment={comment}
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

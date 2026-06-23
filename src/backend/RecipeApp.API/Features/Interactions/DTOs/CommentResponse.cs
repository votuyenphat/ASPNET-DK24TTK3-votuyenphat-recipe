public class CommentResponse
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public int? ParentCommentId { get; set; } // THÊM DÒNG NÀY
    public DateTime CreatedAt { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string? AuthorAvatar { get; set; }
    public string AuthorId { get; set; } = string.Empty;
    public List<CommentResponse> Replies { get; set; } = new();
}
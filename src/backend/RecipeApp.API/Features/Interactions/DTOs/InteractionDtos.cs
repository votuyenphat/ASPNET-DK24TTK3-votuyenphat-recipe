namespace RecipeApp.API.Features.Interactions.DTOs
{
    public class RatingRequest
    {
        public byte StarCount { get; set; } // Giới hạn 1-5
    }

    public class CommentRequest
    {
        public string Content { get; set; } = string.Empty;
        public int? ParentCommentId { get; set; }
    }

    public class CommentResponse
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string? AuthorAvatar { get; set; }
        public List<CommentResponse> Replies { get; set; } = new();
    }
}
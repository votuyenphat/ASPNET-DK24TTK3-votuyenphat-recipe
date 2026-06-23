namespace RecipeApp.API.Infrastructure.Database.Entities
{
    public class CommentEntity
    {
        public int Id { get; set; }
        public int RecipeId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int? ParentCommentId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public RecipeEntity? Recipe { get; set; }
        public UserEntity? User { get; set; }
        public CommentEntity? ParentComment { get; set; }
        public ICollection<CommentEntity> Replies { get; set; } = new List<CommentEntity>();
    }
}
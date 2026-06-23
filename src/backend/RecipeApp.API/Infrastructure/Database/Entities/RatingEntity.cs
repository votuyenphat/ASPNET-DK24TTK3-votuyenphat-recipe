namespace RecipeApp.API.Infrastructure.Database.Entities
{
    public class RatingEntity
    {
        public string UserId { get; set; } = string.Empty;
        public int RecipeId { get; set; }
        public byte StarCount { get; set; } // 1-5
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public UserEntity? User { get; set; }
        public RecipeEntity? Recipe { get; set; }
    }
}
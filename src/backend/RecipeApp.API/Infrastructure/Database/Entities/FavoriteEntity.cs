namespace RecipeApp.API.Infrastructure.Database.Entities
{
    public class FavoriteEntity
    {
        public string UserId { get; set; } = string.Empty;
        public int RecipeId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public UserEntity? User { get; set; }
        public RecipeEntity? Recipe { get; set; }
    }
}
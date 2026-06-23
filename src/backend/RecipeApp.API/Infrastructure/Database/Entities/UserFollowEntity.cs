namespace RecipeApp.API.Infrastructure.Database.Entities
{
    public class UserFollowEntity
    {
        public string FollowerId { get; set; } = string.Empty;
        public string FollowedId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public UserEntity? Follower { get; set; }
        public UserEntity? Followed { get; set; }
    }
}
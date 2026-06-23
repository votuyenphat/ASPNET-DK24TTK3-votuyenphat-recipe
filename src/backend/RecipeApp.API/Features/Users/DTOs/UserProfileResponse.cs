namespace RecipeApp.API.Features.Users.DTOs
{
    public class UserProfileResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public string? CoverUrl { get; set; }
        public int TotalRecipes { get; set; }
        public int TotalFollowers { get; set; }
        public int TotalFollowing { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
using RecipeApp.API.Features.Recipes.DTOs;

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

    public class PublicProfileResponse
{
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? CoverUrl { get; set; }
    public string? Bio { get; set; }
    public int TotalFollowers { get; set; }
    public int TotalRecipes { get; set; }
    public bool IsFollowing { get; set; } // Người xem hiện tại có đang theo dõi người này không?
    public List<RecipeSummaryResponse> Recipes { get; set; } = new();
}
}
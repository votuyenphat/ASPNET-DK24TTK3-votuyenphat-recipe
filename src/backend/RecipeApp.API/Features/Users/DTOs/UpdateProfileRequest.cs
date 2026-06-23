namespace RecipeApp.API.Features.Users.DTOs
{
    public class UpdateProfileRequest
    {
        public string DisplayName { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public string? CoverUrl { get; set; }
    }
}
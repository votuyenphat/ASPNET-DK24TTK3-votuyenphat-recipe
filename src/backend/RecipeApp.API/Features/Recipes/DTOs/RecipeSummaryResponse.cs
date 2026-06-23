namespace RecipeApp.API.Features.Recipes.DTOs
{
    public class RecipeSummaryResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? CoverImageUrl { get; set; }
        public int TotalTimeMinutes { get; set; }
        public int FavoriteCount { get; set; }
        
        public string AuthorName { get; set; } = string.Empty;
        public string? AuthorAvatar { get; set; }
    }
}
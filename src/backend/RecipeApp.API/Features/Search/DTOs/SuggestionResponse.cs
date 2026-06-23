namespace RecipeApp.API.Features.Search.DTOs
{
    // DTO cho Gợi ý nhanh trên Header
    public class SuggestionResponse
    {
        public string Type { get; set; } = string.Empty; // "recipe" hoặc "tag"
        public string Text { get; set; } = string.Empty; // Tiêu đề hoặc Tên Tag
        public string Slug { get; set; } = string.Empty; // Dùng để click chuyển link
    }

    // DTO cho Tìm kiếm nâng cao có phân trang
    public class AdvancedSearchRequest
    {
        public string? Query { get; set; }
        public int? CategoryId { get; set; }
        public byte? Difficulty { get; set; }
        public string? Tag { get; set; }
        public string SortBy { get; set; } = "newest"; // newest, popular, rating
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 12;
    }
}
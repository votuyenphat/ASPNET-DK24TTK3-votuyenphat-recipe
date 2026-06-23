namespace RecipeApp.API.Features.Recipes.DTOs
{
    public class RecipeCreateRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }
        public int? CategoryId { get; set; }
        
        public int PrepTimeMinutes { get; set; }
        public int CookTimeMinutes { get; set; }
        public int Servings { get; set; }
        public byte Difficulty { get; set; }

        public List<IngredientDto> Ingredients { get; set; } = new();
        public List<StepDto> Steps { get; set; } = new();
    }

    public class IngredientDto
    {
        public string Name { get; set; } = string.Empty; // Tên nguyên liệu (Ví dụ: "Thịt heo")
        public string Amount { get; set; } = string.Empty; // Định lượng (Ví dụ: "500")
        public string? Unit { get; set; } // Đơn vị (Ví dụ: "Gram")
        public string? Note { get; set; }
    }

    public class StepDto
    {
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }
}
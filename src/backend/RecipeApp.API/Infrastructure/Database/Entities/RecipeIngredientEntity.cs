namespace RecipeApp.API.Infrastructure.Database.Entities
{
    public class RecipeIngredientEntity
    {
        public int RecipeId { get; set; }
        public int IngredientId { get; set; }

        public string Amount { get; set; } = string.Empty;
        public string? Unit { get; set; }
        public string? Note { get; set; }
        public int SortOrder { get; set; } = 0;

        // Navigation Properties
        public RecipeEntity? Recipe { get; set; }
        public IngredientEntity? Ingredient { get; set; }
    }
}
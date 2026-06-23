namespace RecipeApp.API.Infrastructure.Database.Entities
{
    public class CategoryEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? IconUrl { get; set; }
        public int SortOrder { get; set; } = 0;

        // Navigation property
        public ICollection<RecipeEntity> Recipes { get; set; } = new List<RecipeEntity>();
    }
}
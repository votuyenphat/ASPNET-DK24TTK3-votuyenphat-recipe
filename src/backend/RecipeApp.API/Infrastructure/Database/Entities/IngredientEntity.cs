namespace RecipeApp.API.Infrastructure.Database.Entities
{
    public class IngredientEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public ICollection<RecipeIngredientEntity> RecipeIngredients { get; set; } = new List<RecipeIngredientEntity>();
    }
}
namespace RecipeApp.API.Infrastructure.Database.Entities
{
    public class RecipeTagEntity
    {
        public int RecipeId { get; set; }
        public int TagId { get; set; }

        public RecipeEntity? Recipe { get; set; }
        public TagEntity? Tag { get; set; }
    }
}
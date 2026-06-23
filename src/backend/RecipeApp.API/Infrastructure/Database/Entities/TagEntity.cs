namespace RecipeApp.API.Infrastructure.Database.Entities
{
    public class TagEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;

        // Quan hệ nhiều - nhiều với Recipe thông qua bảng trung gian
        public ICollection<RecipeTagEntity> RecipeTags { get; set; } = new List<RecipeTagEntity>();
    }
}
namespace RecipeApp.API.Infrastructure.Database.Entities
{
    public class InstructionStepEntity
    {
        public int Id { get; set; }
        public int RecipeId { get; set; }
        
        public int StepOrder { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? VideoUrl { get; set; }

        // Navigation Property
        public RecipeEntity? Recipe { get; set; }
    }
}
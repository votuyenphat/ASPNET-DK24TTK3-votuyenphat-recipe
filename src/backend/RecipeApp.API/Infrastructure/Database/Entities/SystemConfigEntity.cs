namespace RecipeApp.API.Infrastructure.Database.Entities
{
    public class SystemConfigEntity
    {
        public string Key { get; set; } = string.Empty; // VD: "KitchenTip", "WeeklyChallenge"
        public string Value { get; set; } = string.Empty; // Nội dung hoặc JSON payload
        public string? Description { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
using System;

namespace RecipeApp.API.Infrastructure.Database.Entities
{
    public class ChallengeEntity
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TagName { get; set; } = string.Empty; // Hashtag định danh sự kiện để gom bài viết, VD: "thuthach-monchay"
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
namespace RecipeApp.API.Infrastructure.Database.Entities
{
    public class SponsoredCampaignEntity
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string TargetUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
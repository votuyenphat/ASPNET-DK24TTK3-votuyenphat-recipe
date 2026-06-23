namespace RecipeApp.API.Infrastructure.Database.Entities
{
    public class RecipeEntity
    {
        public int Id { get; set; }
        
        public string AuthorId { get; set; } = string.Empty; // Khóa ngoại tới UserEntity (Id của IdentityUser là string)
        public int? CategoryId { get; set; }

        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }

        public int PrepTimeMinutes { get; set; } = 0;
        public int CookTimeMinutes { get; set; } = 0;
        public int Servings { get; set; } = 1;
        public byte Difficulty { get; set; } = 1; // 1=Easy, 2=Medium, 3=Hard

        public string? Cuisine { get; set; }
        public string? YoutubeVideoUrl { get; set; }
        public byte Status { get; set; } = 1; // 0=Draft, 1=Pending, 2=Approved, 3=Rejected
        public string Slug { get; set; } = string.Empty;

        public int ViewCount { get; set; } = 0;
        public int FavoriteCount { get; set; } = 0;
        public int CommentCount { get; set; } = 0;
        public decimal AverageRating { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Navigation Properties
        public UserEntity? Author { get; set; }
        public CategoryEntity? Category { get; set; }
        
        public ICollection<RecipeIngredientEntity> Ingredients { get; set; } = new List<RecipeIngredientEntity>();
        public ICollection<InstructionStepEntity> InstructionSteps { get; set; } = new List<InstructionStepEntity>();
        // Tạm thời bỏ qua Images, Tags, Ratings, Comments để focus luồng chính trước
    }
}
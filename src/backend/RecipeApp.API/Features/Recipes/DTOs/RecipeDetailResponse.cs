namespace RecipeApp.API.Features.Recipes.DTOs
{
    public class RecipeDetailResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }
        public int PrepTimeMinutes { get; set; }
        public int CookTimeMinutes { get; set; }
        public int Servings { get; set; }
        public byte Difficulty { get; set; }
        public string? Cuisine { get; set; }
        public string? YoutubeVideoUrl { get; set; }
        public string Slug { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        // Thông tin tác giả (Author)
        public string AuthorId { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public string? AuthorAvatar { get; set; }

        // Tên danh mục (Category)
        public int? CategoryId { get; set; } // Thêm dòng này để Frontend load dropdown
        public string? CategoryName { get; set; }

        public int CommentCount { get; set; }
        public decimal AverageRating { get; set; }
        public int AuthorFollowers { get; set; } // Số người theo dõi tác giả
        public List<string> Tags { get; set; } = new(); // Danh sách hashtag

        public int FavoriteCount { get; set; } // Số người đã yêu thích công thức này
        public bool IsFavorited { get; set; } // Current user đã tim chưa?
        public bool IsFollowing { get; set; } // Current user đã theo dõi tác giả chưa?

        public int? CurrentUserRating { get; set; } // Đánh giá của current user (1-5), null nếu chưa đánh giá

        // Danh sách dữ liệu lồng ghép
        public List<RecipeIngredientDetailDto> Ingredients { get; set; } = new();
        public List<InstructionStepDetailDto> Steps { get; set; } = new();
    }

    public class RecipeIngredientDetailDto
    {
        public int IngredientId { get; set; }
        public string Name { get; set; } = string.Empty; // Tên từ bảng Ingredients
        public string Amount { get; set; } = string.Empty; // Số lượng từ bảng trung gian
        public string? Unit { get; set; }
        public string? Note { get; set; }
    }

    public class InstructionStepDetailDto
    {
        public int Id { get; set; }
        public int StepOrder { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }
}
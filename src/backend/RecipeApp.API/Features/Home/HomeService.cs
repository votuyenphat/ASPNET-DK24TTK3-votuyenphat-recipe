using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Features.Recipes.DTOs;
using RecipeApp.API.Infrastructure.Database;

namespace RecipeApp.API.Features.Home
{
    public class HomeService
    {
        private readonly AppDbContext _context;

        public HomeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetHomePageDataAsync()
        {
            // 1. Món nổi bật (Top 6 nhiều Tim nhất)
            var featuredRecipes = await _context.Recipes
                .Include(r => r.Author)
                .Where(r => !r.IsDeleted)
                .OrderByDescending(r => r.FavoriteCount).ThenByDescending(r => r.AverageRating)
                .Take(6)
                .Select(r => new RecipeSummaryResponse
                {
                    Id = r.Id, Title = r.Title, Slug = r.Slug,
                    CoverImageUrl = r.CoverImageUrl, TotalTimeMinutes = r.PrepTimeMinutes + r.CookTimeMinutes,
                    FavoriteCount = r.FavoriteCount, AuthorName = r.Author!.DisplayName, AuthorAvatar = r.Author.AvatarUrl
                }).ToListAsync();

            // 2. Món mới nhất (Top 8 mới đăng)
            var newestRecipes = await _context.Recipes
                .Include(r => r.Author)
                .Where(r => !r.IsDeleted)
                .OrderByDescending(r => r.CreatedAt)
                .Take(8)
                .Select(r => new RecipeSummaryResponse
                {
                    // Map tương tự như trên
                    Id = r.Id, Title = r.Title, Slug = r.Slug,
                    CoverImageUrl = r.CoverImageUrl, TotalTimeMinutes = r.PrepTimeMinutes + r.CookTimeMinutes,
                    FavoriteCount = r.FavoriteCount, AuthorName = r.Author!.DisplayName, AuthorAvatar = r.Author.AvatarUrl
                }).ToListAsync();

            // 3. Từ khóa Hot (Top 10 Tag được sử dụng nhiều nhất)
            var hotTags = await _context.RecipeTags
                .GroupBy(rt => rt.Tag!.Name)
                .OrderByDescending(g => g.Count())
                .Take(10)
                .Select(g => g.Key)
                .ToListAsync();

            return new
            {
                FeaturedRecipes = featuredRecipes,
                NewestRecipes = newestRecipes,
                HotTags = hotTags
            };
        }
    }
}
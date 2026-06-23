using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Features.Search.DTOs;
using RecipeApp.API.Infrastructure.Database;
using RecipeApp.API.Features.Recipes.DTOs;

namespace RecipeApp.API.Features.Search
{
    public class SearchService
    {
        private readonly AppDbContext _context;

        public SearchService(AppDbContext context)
        {
            _context = context;
        }

        // 1. LẤY GỢI Ý NHANH (CHO HEADER)
        public async Task<List<SuggestionResponse>> GetSuggestionsAsync(string query)
        {
            var results = new List<SuggestionResponse>();
            if (string.IsNullOrWhiteSpace(query)) return results;

            var keyword = query.Trim().ToLower();

            // Tìm Tag khớp (Lấy top 3)
            var tags = await _context.Tags
                .Where(t => t.Name.ToLower().Contains(keyword))
                .Take(3)
                .Select(t => new SuggestionResponse { Type = "tag", Text = t.Name, Slug = t.Slug })
                .ToListAsync();

            // Tìm Recipe khớp tiêu đề (Lấy top 5)
            var recipes = await _context.Recipes
                .Where(r => !r.IsDeleted && r.Title.ToLower().Contains(keyword))
                .Take(5)
                .Select(r => new SuggestionResponse { Type = "recipe", Text = r.Title, Slug = r.Slug })
                .ToListAsync();

            results.AddRange(tags);
            results.AddRange(recipes);

            return results;
        }

        // 2. TÌM KIẾM NÂNG CAO (CHO TRANG SEARCH)
        public async Task<(List<RecipeSummaryResponse> Items, int TotalCount)> AdvancedSearchAsync(AdvancedSearchRequest req)
        {
            var query = _context.Recipes
                .Include(r => r.Author)
                .Where(r => !r.IsDeleted)
                .AsQueryable();

            // Lọc theo từ khóa
            if (!string.IsNullOrWhiteSpace(req.Query))
            {
                var keyword = req.Query.Trim().ToLower();
                query = query.Where(r => r.Title.ToLower().Contains(keyword) || r.Description.ToLower().Contains(keyword));
            }

            // Lọc theo Category
            if (req.CategoryId.HasValue)
                query = query.Where(r => r.CategoryId == req.CategoryId.Value);

            // Lọc theo độ khó
            if (req.Difficulty.HasValue)
                query = query.Where(r => r.Difficulty == req.Difficulty.Value);

            // Lọc theo Tag
            if (!string.IsNullOrWhiteSpace(req.Tag))
            {
                query = query.Where(r => r.RecipeTags.Any(rt => rt.Tag.Slug == req.Tag || rt.Tag.Name == req.Tag));
            }

            // Sắp xếp
            query = req.SortBy.ToLower() switch
            {
                "popular" => query.OrderByDescending(r => r.FavoriteCount).ThenByDescending(r => r.CommentCount),
                "rating" => query.OrderByDescending(r => r.AverageRating),
                _ => query.OrderByDescending(r => r.CreatedAt) // newest là mặc định
            };

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((req.Page - 1) * req.PageSize)
                .Take(req.PageSize)
                .Select(r => new RecipeSummaryResponse
                {
                    Id = r.Id,
                    Title = r.Title,
                    Slug = r.Slug,
                    CoverImageUrl = r.CoverImageUrl,
                    TotalTimeMinutes = r.PrepTimeMinutes + r.CookTimeMinutes,
                    FavoriteCount = r.FavoriteCount,
                    AuthorName = r.Author!.DisplayName,
                    AuthorAvatar = r.Author.AvatarUrl
                })
                .ToListAsync();

            return (items, totalCount);
        }
    }
}
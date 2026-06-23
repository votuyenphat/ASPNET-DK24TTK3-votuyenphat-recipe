using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Features.Admin.DTOs;
using RecipeApp.API.Infrastructure.Database;

namespace RecipeApp.API.Features.Home
{
    [ApiController]
    [Route("api/features/[controller]")]
    public class HomeController : ControllerBase
    {
        private readonly HomeService _homeService;
        private readonly AppDbContext _context; // Dùng tạm cho API init, sau này có thể tách riêng service nếu cần

        public HomeController(HomeService homeService, AppDbContext context)
        {
            _context = context;
            _homeService = homeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetHomeData()
        {
            var data = await _homeService.GetHomePageDataAsync();
            return Ok(data);
        }
    



        [HttpGet("init")]
        public async Task<IActionResult> GetHomeInitializationData()
        {
            // 1. Lấy chiến dịch tài trợ lớn đang active ngẫu nhiên (Dành cho banner lớn trang chủ)
            var activeBanner = await _context.SponsoredCampaigns
                .Where(s => s.IsActive && s.StartDate <= DateTime.UtcNow && s.EndDate >= DateTime.UtcNow)
                .OrderBy(s => Guid.NewGuid()) 
                .Select(s => new {
                    s.Id,
                    s.Title,
                    s.BrandName,
                    s.ImageUrl,
                    s.TargetUrl
                })
                .FirstOrDefaultAsync();

            // 2. Lấy cấu hình thử thách tuần hiện tại từ Bento Settings JSON
            var bentoConfigStr = (await _context.SystemConfigs.FindAsync("BentoGridSettings"))?.Value;
            var bentoSettings = string.IsNullOrEmpty(bentoConfigStr) 
                ? null 
                : JsonSerializer.Deserialize<BentoSettingsRequest>(bentoConfigStr);

            // 3. Lấy 8 bài viết mới nhất cho Feed trang chủ
            var newestRecipes = await _context.Recipes
                .Include(r => r.Author)
                .Where(r => !r.IsDeleted)
                .OrderByDescending(r => r.CreatedAt)
                .Take(8)
                .Select(r => new {
                    r.Id, r.Title, r.Slug, r.CoverImageUrl,
                    TotalTimeMinutes = r.PrepTimeMinutes + r.CookTimeMinutes,
                    r.FavoriteCount, AuthorName = r.Author!.DisplayName, AuthorAvatar = r.Author.AvatarUrl
                })
                .ToListAsync();

            return Ok(new
            {
                ActiveBanner = activeBanner,
                Challenge = bentoSettings == null ? null : new {
                    Title = bentoSettings.ChallengeTitle,
                    Desc = bentoSettings.ChallengeDesc,
                    Link = bentoSettings.ChallengeMode == "manual" && bentoSettings.ChallengeId.HasValue 
                        ? $"/challenges/{bentoSettings.ChallengeId.Value}" 
                        : null // Nếu là auto thì link sẽ được tính toán ở frontend dựa trên ChallengeTag
                },
                NewestRecipes = newestRecipes
            });
        }
    }
}
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Features.Admin.DTOs;
using RecipeApp.API.Infrastructure.Database;
using RecipeApp.API.Infrastructure.Database.Entities;

namespace RecipeApp.API.Features.Admin
{
    public class AdminService
    {
        private readonly AppDbContext _context;

        public AdminService(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. DASHBOARD OVERVIEW
        // ==========================================
        public async Task<DashboardOverviewResponse> GetOverviewStatsAsync()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalRecipes = await _context.Recipes.CountAsync(r => !r.IsDeleted);
            var totalComments = await _context.Comments.CountAsync(c => !c.IsDeleted);
            var activeSponsors = await _context.SponsoredCampaigns
                .CountAsync(s => s.IsActive && s.StartDate <= DateTime.UtcNow && s.EndDate >= DateTime.UtcNow);

            var interactionChart = new List<DailyStatDto>();
            var today = DateTime.UtcNow.Date;

            var recentRecipes = await _context.Recipes
                .Include(r => r.Author)
                .OrderByDescending(r => r.CreatedAt)
                .Take(5)
                .Select(r => new AdminRecipeSummaryDto
                {
                    Id = r.Id,
                    Title = r.Title,
                    AuthorName = r.Author!.DisplayName,
                    CreatedAt = r.CreatedAt,
                    FavoriteCount = r.FavoriteCount,
                    IsDeleted = r.IsDeleted
                })
                .ToListAsync();

            var categoryBreakdown = await _context.Categories
                .Select(c => new CategoryStatDto { Name = c.Name, Count = c.Recipes.Count })
                .OrderByDescending(c => c.Count)
                .Take(3)
                .ToListAsync();

            for (int i = 6; i >= 0; i--)
            {
                var targetDate = today.AddDays(-i);
                var newRecipes = await _context.Recipes.CountAsync(r => r.CreatedAt.Date == targetDate && !r.IsDeleted);
                var newComments = await _context.Comments.CountAsync(c => c.CreatedAt.Date == targetDate && !c.IsDeleted);

                interactionChart.Add(new DailyStatDto
                {
                    DateLabel = targetDate.ToString("dd/MM"),
                    Count = newRecipes + newComments
                });
            }

            return new DashboardOverviewResponse
            {
                TotalUsers = totalUsers, TotalRecipes = totalRecipes, TotalComments = totalComments,
                ActiveSponsors = activeSponsors, RecentRecipes = recentRecipes,
                CategoryBreakdown = categoryBreakdown, InteractionChart = interactionChart
            };
        }

        // ==========================================
        // 2. BENTO GRID CONFIGURATION
        // ==========================================
        public async Task UpdateBentoConfigAsync(BentoSettingsRequest request)
        {
            var jsonConfig = JsonSerializer.Serialize(request);
            await UpsertConfigAsync("BentoGridSettings", jsonConfig);
            await _context.SaveChangesAsync();
        }

        private async Task UpsertConfigAsync(string key, string value)
        {
            var config = await _context.SystemConfigs.FindAsync(key);
            if (config != null) { config.Value = value; config.UpdatedAt = DateTime.UtcNow; }
            else { _context.SystemConfigs.Add(new SystemConfigEntity { Key = key, Value = value }); }
        }

        public async Task<BentoLiveResponse> GetLiveBentoDataAsync()
        {
            var configStr = (await _context.SystemConfigs.FindAsync("BentoGridSettings"))?.Value;
            var settings = string.IsNullOrEmpty(configStr) 
                ? new BentoSettingsRequest() 
                : JsonSerializer.Deserialize<BentoSettingsRequest>(configStr);

            var response = new BentoLiveResponse();
            
            // 1. HERO RECIPE
            if (settings!.HeroMode == "manual" && settings.HeroRecipeId.HasValue) {
                response.HeroRecipe = await GetRecipeSummaryByIdAsync(settings.HeroRecipeId.Value);
            } else {
                response.HeroRecipe = await _context.Recipes.Include(r => r.Author).Where(r => !r.IsDeleted)
                    .OrderByDescending(r => r.FavoriteCount)
                    .Select(r => new { r.Id, r.Title, r.Slug, r.CoverImageUrl, r.Author!.DisplayName })
                    .FirstOrDefaultAsync();
            }

            // 2. SPONSORED RECIPES (Xử lý chuỗi ID an toàn)
            if (!string.IsNullOrWhiteSpace(settings.SponsoredRecipeIds)) {
                var ids = settings.SponsoredRecipeIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(id => int.TryParse(id.Trim(), out var parsed) ? parsed : 0)
                            .Where(id => id > 0).ToList();
                
                response.SponsoredRecipes = await _context.Recipes.Where(r => ids.Contains(r.Id) && !r.IsDeleted)
                    .Select(r => new { r.Id, r.Title, r.Slug, r.CoverImageUrl } as object).ToListAsync();
            }

            // 3. TOP CHEF
            if (settings.ChefMode == "manual" && !string.IsNullOrEmpty(settings.ChefUserId)) {
                response.TopChef = await _context.Users.Where(u => u.Id == settings.ChefUserId)
                    .Select(u => new { u.Id, u.DisplayName, u.AvatarUrl, u.TotalFollowers }).FirstOrDefaultAsync();
            } else {
                response.TopChef = await _context.Users.OrderByDescending(u => u.TotalFollowers)
                    .Select(u => new { u.Id, u.DisplayName, u.AvatarUrl, u.TotalFollowers }).FirstOrDefaultAsync();
            }

            // 4. HOT TAGS
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
            response.HotTags = await _context.RecipeTags
                .Where(rt => rt.Recipe!.CreatedAt >= sevenDaysAgo)
                .GroupBy(rt => rt.Tag!.Name).OrderByDescending(g => g.Count()).Take(4)
                .Select(g => g.Key).ToListAsync();

            // 5. TEXT & CHALLENGE
          response.KitchenTip = settings!.KitchenTip;
            
            ChallengeEntity? activeChallenge = null;
            if (settings.ChallengeMode == "manual" && settings.ChallengeId.HasValue)
            {
                activeChallenge = await _context.Challenges.FindAsync(settings.ChallengeId.Value);
            }
            else
            {
                // Tự động tìm thử thách đang trong thời gian hiệu lực
                activeChallenge = await _context.Challenges
                    .Where(c => c.IsActive && c.StartDate <= DateTime.UtcNow && c.EndDate >= DateTime.UtcNow)
                    .OrderByDescending(c => c.CreatedAt)
                    .FirstOrDefaultAsync();
            }

            if (activeChallenge != null)
            {
                // ĐẾM SỐ LƯỢNG BÀI DỰ THI (Dựa trên số công thức sử dụng hashtag của sự kiện)
                var participantCount = await _context.RecipeTags
                    .Where(rt => rt.Tag!.Name.ToLower() == activeChallenge.TagName.ToLower())
                    .Select(rt => rt.RecipeId)
                    .Distinct()
                    .CountAsync();

                response.Challenge = new
                {
                    Id = activeChallenge.Id,
                    Title = activeChallenge.Title,
                    Desc = activeChallenge.Description,
                    TagName = activeChallenge.TagName,
                    StartDate = activeChallenge.StartDate,
                    EndDate = activeChallenge.EndDate,
                    Link = "/challenges", // Trỏ thẳng về trang sự kiện
                    ParticipantCount = participantCount // Số người tham gia thật
                };
            }

            return response;
        }

        // Hàm Helper lấy Tóm tắt Recipe
        private async Task<object?> GetRecipeSummaryByIdAsync(int id)
        {
            return await _context.Recipes.Include(r => r.Author).Where(r => r.Id == id && !r.IsDeleted)
                .Select(r => new { r.Id, r.Title, r.Slug, r.CoverImageUrl, r.Author!.DisplayName })
                .FirstOrDefaultAsync();
        }

        // ==========================================
        // 3. CATEGORIES & TAGS MANGEMENT
        // ==========================================
        public async Task<object> GetCategoriesAdminAsync() => await _context.Categories.Select(c => new { c.Id, c.Name, c.Slug }).ToListAsync();

        public async Task<bool> CreateCategoryAsync(CategoryRequest request)
        {
            var slug = GenerateSlug(request.Name);
            if (await _context.Categories.AnyAsync(c => c.Slug == slug)) return false;
            _context.Categories.Add(new CategoryEntity { Name = request.Name, Slug = slug });
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateCategoryAsync(int id, CategoryRequest request)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return false;
            category.Name = request.Name;
            category.Slug = GenerateSlug(request.Name);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.Categories.Include(c => c.Recipes).FirstOrDefaultAsync(c => c.Id == id);
            if (category == null) return false;
            if (category.Recipes.Any()) throw new InvalidOperationException("Không thể xóa danh mục đang chứa công thức.");
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<object> GetTagsAdminAsync() => await _context.Tags
            .Select(t => new { t.Id, t.Name, t.Slug, RecipeCount = t.RecipeTags.Count })
            .OrderByDescending(t => t.RecipeCount).ToListAsync();

        public async Task<bool> UpdateTagAsync(int id, TagRequest request)
        {
            var tag = await _context.Tags.FindAsync(id);
            if (tag == null) return false;
            tag.Name = request.Name;
            tag.Slug = GenerateSlug(request.Name);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteTagAsync(int id)
        {
            var tag = await _context.Tags.FindAsync(id);
            if (tag == null) return false;
            _context.Tags.Remove(tag);
            await _context.SaveChangesAsync();
            return true;
        }

        // ==========================================
        // 4. RECIPES MANAGEMENT (BỔ SUNG MỚI ĐỂ SỬA LỖI HACKY)
        // ==========================================
        public async Task<List<AdminRecipeSummaryDto>> GetAllRecipesAdminAsync()
        {
            return await _context.Recipes
                .Include(r => r.Author)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new AdminRecipeSummaryDto
                {
                    Id = r.Id,
                    Title = r.Title,
                    AuthorName = r.Author!.DisplayName,
                    CreatedAt = r.CreatedAt,
                    FavoriteCount = r.FavoriteCount,
                    IsDeleted = r.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<bool> ToggleRecipeStatusAsync(int recipeId, bool isDeleted)
        {
            var recipe = await _context.Recipes.FindAsync(recipeId);
            if (recipe == null) return false;
            recipe.IsDeleted = isDeleted;
            recipe.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<object> GetRecipesLookupAsync()
        {
            return await _context.Recipes
                .Where(r => !r.IsDeleted)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new { r.Id, r.Title })
                .ToListAsync();
        }

        // Lấy danh sách người dùng/đầu bếp phục vụ chọn lựa trên UI
        public async Task<object> GetChefsLookupAsync()
        {
            return await _context.Users
                .Select(u => new { u.Id, u.DisplayName })
                .OrderBy(u => u.DisplayName)
                .ToListAsync();
        }

        public async Task<BentoSettingsRequest> GetRawBentoConfigAsync()
        {
            var configStr = (await _context.SystemConfigs.FindAsync("BentoGridSettings"))?.Value;
            if (string.IsNullOrEmpty(configStr)) return new BentoSettingsRequest();
            
            // Giải mã chuỗi JSON ngược thành Object cấu hình gốc ban đầu
            return JsonSerializer.Deserialize<BentoSettingsRequest>(configStr) ?? new BentoSettingsRequest();
        }

        // ==========================================
        // 7. QUẢN LÝ CHIẾN DỊCH TÀI TRỢ
        // ==========================================
        public async Task<object> GetAllSponsorsAsync()
        {
            return await _context.SponsoredCampaigns
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new {
                    s.Id, s.Title, s.BrandName, s.ImageUrl, s.TargetUrl,
                    s.StartDate, s.EndDate, s.IsActive, s.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> CreateSponsorAsync(SponsoredCampaignRequest request)
        {
            var sponsor = new SponsoredCampaignEntity
            {
                Title = request.Title,
                BrandName = request.BrandName,
                ImageUrl = request.ImageUrl,
                TargetUrl = request.TargetUrl,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                IsActive = request.IsActive
            };
            
            _context.SponsoredCampaigns.Add(sponsor);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateSponsorAsync(int id, SponsoredCampaignRequest request)
        {
            var sponsor = await _context.SponsoredCampaigns.FindAsync(id);
            if (sponsor == null) return false;

            sponsor.Title = request.Title;
            sponsor.BrandName = request.BrandName;
            sponsor.ImageUrl = request.ImageUrl;
            sponsor.TargetUrl = request.TargetUrl;
            sponsor.StartDate = request.StartDate;
            sponsor.EndDate = request.EndDate;
            sponsor.IsActive = request.IsActive;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleSponsorStatusAsync(int id, bool isActive)
        {
            var sponsor = await _context.SponsoredCampaigns.FindAsync(id);
            if (sponsor == null) return false;

            sponsor.IsActive = isActive;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteSponsorAsync(int id)
        {
            var sponsor = await _context.SponsoredCampaigns.FindAsync(id);
            if (sponsor == null) return false;

            _context.SponsoredCampaigns.Remove(sponsor);
            await _context.SaveChangesAsync();
            return true;
        }

        // ==========================================
        // 8. QUẢN LÝ THỬ THÁCH TUẦN (CHALLENGES)
        // ==========================================
        public async Task<object> GetAllChallengesAsync()
        {
            return await _context.Challenges
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> CreateChallengeAsync(ChallengeRequest request)
        {
            var challenge = new ChallengeEntity
            {
                Title = request.Title, Description = request.Description,
                TagName = request.TagName.Replace("#", "").Trim().ToLower(),
                StartDate = request.StartDate, EndDate = request.EndDate, IsActive = request.IsActive
            };
            _context.Challenges.Add(challenge);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateChallengeAsync(int id, ChallengeRequest request)
        {
            var challenge = await _context.Challenges.FindAsync(id);
            if (challenge == null) return false;

            challenge.Title = request.Title;
            challenge.Description = request.Description;
            challenge.TagName = request.TagName.Replace("#", "").Trim().ToLower();
            challenge.StartDate = request.StartDate;
            challenge.EndDate = request.EndDate;
            challenge.IsActive = request.IsActive;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleChallengeStatusAsync(int id, bool isActive)
        {
            var challenge = await _context.Challenges.FindAsync(id);
            if (challenge == null) return false;
            challenge.IsActive = isActive;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteChallengeAsync(int id)
        {
            var challenge = await _context.Challenges.FindAsync(id);
            if (challenge == null) return false;
            _context.Challenges.Remove(challenge);
            await _context.SaveChangesAsync();
            return true;
        }

        // Lấy danh sách phục vụ Dropdown Bento Config
        public async Task<object> GetChallengesLookupAsync()
        {
            return await _context.Challenges
                .Where(c => c.IsActive)
                .Select(c => new { c.Id, c.Title })
                .ToListAsync();
        }

        private string GenerateSlug(string phrase) => Regex.Replace(phrase.ToLower(), @"\s+", "-");
    }
}
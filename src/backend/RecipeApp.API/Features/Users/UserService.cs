using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Features.Recipes.DTOs;
using RecipeApp.API.Features.Users.DTOs;
using RecipeApp.API.Infrastructure.Database;
using RecipeApp.API.Infrastructure.Database.Entities;

namespace RecipeApp.API.Features.Users
{
    public class UserService
    {
        private readonly UserManager<UserEntity> _userManager;
        private readonly string avatarUrl = "https://i.pravatar.cc/150?img=51";

        private  AppDbContext _context;

        public UserService(UserManager<UserEntity> userManager, AppDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<UserProfileResponse?> GetProfileByIdAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return null;

            return new UserProfileResponse
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                DisplayName = user.DisplayName,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl ?? avatarUrl,
                CoverUrl = user.CoverUrl,
                TotalRecipes = user.TotalRecipes,
                TotalFollowers = user.TotalFollowers,
                TotalFollowing = user.TotalFollowing,
                CreatedAt = user.CreatedAt
            };
        }
    
        public async Task<bool> UpdateProfileAsync(string userId, UpdateProfileRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            // Cập nhật các trường
            user.DisplayName = request.DisplayName;
            user.Bio = request.Bio;
            user.AvatarUrl = request.AvatarUrl;
            user.CoverUrl = request.CoverUrl;

            await _context.SaveChangesAsync();
            return true;
        }
    
        public async Task<PublicProfileResponse?> GetPublicProfileAsync(string targetUserId, string? currentUserId = null)
        {
            var user = await _context.Users.FindAsync(targetUserId);
            if (user == null) return null;

            // Lấy danh sách công thức của người này
            var recipes = await _context.Recipes
                .Where(r => r.AuthorId == targetUserId && !r.IsDeleted)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new RecipeSummaryResponse
                {
                    Id = r.Id, Title = r.Title, Slug = r.Slug,
                    CoverImageUrl = r.CoverImageUrl, TotalTimeMinutes = r.PrepTimeMinutes + r.CookTimeMinutes,
                    FavoriteCount = r.FavoriteCount, AuthorName = user.DisplayName, AuthorAvatar = user.AvatarUrl
                }).ToListAsync();

            // Kiểm tra trạng thái Follow nếu có người đang đăng nhập vào xem
            bool isFollowing = false;
            if (!string.IsNullOrEmpty(currentUserId) && currentUserId != targetUserId)
            {
                isFollowing = await _context.UserFollows
                    .AnyAsync(uf => uf.FollowerId == currentUserId && uf.FollowedId == targetUserId);
            }

            return new PublicProfileResponse
            {
                UserId = user.Id,
                DisplayName = user.DisplayName,
                AvatarUrl = user.AvatarUrl,
                CoverUrl = user.CoverUrl,
                Bio = user.Bio,
                TotalFollowers = user.TotalFollowers,
                TotalRecipes = recipes.Count, // Đếm thực tế số bài
                IsFollowing = isFollowing,
                Recipes = recipes
            };
        }
    }
}
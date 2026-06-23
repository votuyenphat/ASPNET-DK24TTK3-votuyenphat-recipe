using Microsoft.AspNetCore.Identity;
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
    }
}
using Microsoft.AspNetCore.Identity;
using RecipeApp.API.Features.Users.DTOs;
using RecipeApp.API.Infrastructure.Database.Entities;

namespace RecipeApp.API.Features.Users
{
    public class UserService
    {
        private readonly UserManager<UserEntity> _userManager;

        private readonly string avatarUrl = "https://i.pravatar.cc/150?img=51";


        public UserService(UserManager<UserEntity> userManager)
        {
            _userManager = userManager;
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
    }
}
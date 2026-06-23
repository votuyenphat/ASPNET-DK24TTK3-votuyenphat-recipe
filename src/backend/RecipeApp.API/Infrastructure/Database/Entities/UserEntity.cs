using Microsoft.AspNetCore.Identity;

namespace RecipeApp.API.Infrastructure.Database.Entities
{
        public class UserEntity : IdentityUser{
        public string DisplayName { get; set; } = string.Empty;

        public string? Bio { get; set; }

        public string? AvatarUrl { get; set; }

        public string? CoverUrl { get; set; }

        public int TotalRecipes { get; set; } = 0;

        public int TotalFollowers { get; set; } = 0;

        public int TotalFollowing { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public bool IsDeleted { get; set; } = false;

        /* =========================
        NAVIGATION PROPERTIES
        ========================= */

        public ICollection<RecipeEntity> Recipes { get; set; }
            = new List<RecipeEntity>();

        // public ICollection<CommentEntity> Comments { get; set; }
        //     = new List<CommentEntity>();

        // public ICollection<FavoriteEntity> Favorites { get; set; }
        //     = new List<FavoriteEntity>();

        // public ICollection<RatingEntity> Ratings { get; set; }
        //     = new List<RatingEntity>();

        // // Followers
        // public ICollection<UserFollowEntity> Followers { get; set; }
        //     = new List<UserFollowEntity>();

        // // Following
        // public ICollection<UserFollowEntity> Following { get; set; }
        //     = new List<UserFollowEntity>();
    }
}
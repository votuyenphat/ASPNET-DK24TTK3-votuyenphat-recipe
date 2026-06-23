using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Features.Interactions.DTOs;
using RecipeApp.API.Infrastructure.Database;
using RecipeApp.API.Infrastructure.Database.Entities;

namespace RecipeApp.API.Features.Interactions
{
    public class InteractionService
    {
        private readonly AppDbContext _context;

        public InteractionService(AppDbContext context)
        {
            _context = context;
        }

        // 1. Logic Thả Tim (Toggle Favorite)
        public async Task<bool> ToggleFavoriteAsync(string userId, int recipeId)
        {
            var recipe = await _context.Recipes.FindAsync(recipeId);
            if (recipe == null) return false;

            var existingFavorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.RecipeId == recipeId);

            if (existingFavorite != null)
            {
                // Đã tim rồi thì Hủy tim
                _context.Favorites.Remove(existingFavorite);
                if (recipe.FavoriteCount > 0) recipe.FavoriteCount -= 1;
            }
            else
            {
                // Chưa tim thì Thêm tim
                _context.Favorites.Add(new FavoriteEntity { UserId = userId, RecipeId = recipeId });
                recipe.FavoriteCount += 1;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // 2. Logic Theo dõi (Toggle Follow)
        public async Task<bool> ToggleFollowAsync(string followerId, string followedId)
        {
            if (followerId == followedId) throw new ArgumentException("Không thể tự theo dõi chính mình.");

            var followedUser = await _context.Users.FindAsync(followedId);
            if (followedUser == null) return false;

            var existingFollow = await _context.UserFollows
                .FirstOrDefaultAsync(uf => uf.FollowerId == followerId && uf.FollowedId == followedId);

            if (existingFollow != null)
            {
                _context.UserFollows.Remove(existingFollow);
                if (followedUser.TotalFollowers > 0) followedUser.TotalFollowers -= 1;
            }
            else
            {
                _context.UserFollows.Add(new UserFollowEntity { FollowerId = followerId, FollowedId = followedId });
                followedUser.TotalFollowers += 1;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // 3. Logic Đánh giá (Rating)
        public async Task<bool> RateRecipeAsync(string userId, int recipeId, byte starCount)
        {
            if (starCount < 1 || starCount > 5) throw new ArgumentException("Số sao phải từ 1 đến 5.");

            var recipe = await _context.Recipes.Include(r => r.Ratings).FirstOrDefaultAsync(r => r.Id == recipeId);
            if (recipe == null) return false;

            var existingRating = await _context.Ratings
                .FirstOrDefaultAsync(r => r.UserId == userId && r.RecipeId == recipeId);

            if (existingRating != null)
            {
                existingRating.StarCount = starCount;
                existingRating.CreatedAt = DateTime.UtcNow; // Cập nhật thời gian
            }
            else
            {
                _context.Ratings.Add(new RatingEntity { UserId = userId, RecipeId = recipeId, StarCount = starCount });
                // Note: Phải lưu xuống trước để có dữ liệu tính trung bình
                await _context.SaveChangesAsync(); 
            }

            // Tính toán lại AverageRating
            var allRatings = await _context.Ratings.Where(r => r.RecipeId == recipeId).ToListAsync();
            if (allRatings.Any())
            {
                recipe.AverageRating = (decimal)allRatings.Average(r => r.StarCount);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // 4. Logic Thêm Bình luận
        public async Task<CommentResponse?> AddCommentAsync(string userId, int recipeId, CommentRequest request)
        {
            var recipe = await _context.Recipes.FindAsync(recipeId);
            if (recipe == null) return null;

            var comment = new CommentEntity
            {
                UserId = userId,
                RecipeId = recipeId,
                Content = request.Content,
                ParentCommentId = request.ParentCommentId
            };

            _context.Comments.Add(comment);
            recipe.CommentCount += 1;
            await _context.SaveChangesAsync();

            // Lấy thông tin user để trả về hiển thị ngay
            var user = await _context.Users.FindAsync(userId);

            return new CommentResponse
            {
                Id = comment.Id,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                AuthorName = user?.DisplayName ?? "Người dùng ẩn danh",
                AuthorAvatar = user?.AvatarUrl
            };
        }

        // 5. Logic Lấy Danh sách Bình luận (Có lồng ghép Replies)
        public async Task<List<CommentResponse>> GetCommentsAsync(int recipeId)
        {
            // Lấy toàn bộ comments của bài viết
            var allComments = await _context.Comments
                .Include(c => c.User)
                .Where(c => c.RecipeId == recipeId && !c.IsDeleted)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            // Tách comment gốc (ParentCommentId == null)
            var rootComments = allComments.Where(c => c.ParentCommentId == null).Select(c => MapToDto(c, allComments)).ToList();

            return rootComments;
        }

        public async Task<bool> UpdateCommentAsync(int commentId, string userId, string newContent)
        {
            var comment = await _context.Comments.FindAsync(commentId);
            
            // Kiểm tra xem comment có tồn tại không, và người sửa có CHÍNH XÁC là người tạo không
            if (comment == null || comment.UserId != userId || comment.IsDeleted) return false;

            comment.Content = newContent;
            comment.UpdatedAt = DateTime.UtcNow; // Cập nhật thời gian sửa
            
            await _context.SaveChangesAsync();
            return true;
        }

        // Hàm Xóa bình luận
        public async Task<bool> DeleteCommentAsync(int commentId, string userId)
        {
            var comment = await _context.Comments.FindAsync(commentId);
            
            // Kiểm tra quyền: Chỉ người viết mới được xóa
            if (comment == null || comment.UserId != userId || comment.IsDeleted) return false;

            comment.IsDeleted = true; // Đánh dấu xóa mềm
            comment.UpdatedAt = DateTime.UtcNow;

            // Giảm số đếm bình luận của bài viết xuống 1
            var recipe = await _context.Recipes.FindAsync(comment.RecipeId);
            if (recipe != null && recipe.CommentCount > 0)
            {
                recipe.CommentCount -= 1;
            }
            
            await _context.SaveChangesAsync();
            return true;
        }

        private CommentResponse MapToDto(CommentEntity comment, List<CommentEntity> allComments)
        {
            return new CommentResponse
            {
                Id = comment.Id,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                AuthorName = comment.User?.DisplayName ?? "Người dùng",
                AuthorAvatar = comment.User?.AvatarUrl,
                ParentCommentId = comment.ParentCommentId,
                AuthorId = comment.UserId,
                Replies = allComments
                    .Where(reply => reply.ParentCommentId == comment.Id)
                    .OrderBy(reply => reply.CreatedAt)
                    .Select(reply => MapToDto(reply, allComments))
                    .ToList()
            };
        }
    }
}
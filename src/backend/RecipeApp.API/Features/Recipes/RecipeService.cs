using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Features.Recipes.DTOs;
using RecipeApp.API.Infrastructure.Database;
using RecipeApp.API.Infrastructure.Database.Entities;
using System.Text.RegularExpressions;

namespace RecipeApp.API.Features.Recipes
{
    public class RecipeService
    {
        private readonly AppDbContext _context;

        public RecipeService(AppDbContext context)
        {
            _context = context;
        }

        // Hàm 1: Lấy danh sách công thức cho Trang chủ
        public async Task<List<RecipeSummaryResponse>> GetAllRecipesAsync()
        {
            return await _context.Recipes
                .Include(r => r.Author)
                .Where(r => r.Status == 2 && !r.IsDeleted) // Chỉ lấy các bài đã duyệt (Status = 2)
                .OrderByDescending(r => r.CreatedAt)
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
        }

        // Hàm 2: Tạo mới công thức
        public async Task<(int Id, string Slug)> CreateRecipeAsync(string userId, RecipeCreateRequest request)
        {
            // 1. Khởi tạo Entity Công thức
            var recipe = new RecipeEntity
            {
                AuthorId = userId,
                CategoryId = request.CategoryId,
                Title = request.Title,
                Description = request.Description,
                CoverImageUrl = request.CoverImageUrl,
                PrepTimeMinutes = request.PrepTimeMinutes,
                CookTimeMinutes = request.CookTimeMinutes,
                Servings = request.Servings,
                Difficulty = request.Difficulty,
                Status = 2, // Để là 1 (Pending - Chờ duyệt) hoặc 2 (Approved luôn cho dễ test)
                Slug = GenerateSlug(request.Title) + "-" + Guid.NewGuid().ToString()[..6] // Tránh trùng slug
            };

            // 2. Xử lý Nguyên liệu
            for (int i = 0; i < request.Ingredients.Count; i++)
            {
                var ingDto = request.Ingredients[i];
                var ingredientName = ingDto.Name.Trim().ToLower();

                // Kiểm tra xem nguyên liệu này đã có trong DB chưa
                var existingIngredient = await _context.Ingredients
                    .FirstOrDefaultAsync(x => x.Name.ToLower() == ingredientName);

                if (existingIngredient == null)
                {
                    existingIngredient = new IngredientEntity { Name = ingDto.Name.Trim() };
                    _context.Ingredients.Add(existingIngredient);
                    await _context.SaveChangesAsync(); // Cần lưu để lấy Id
                }

                // Liên kết nguyên liệu vào công thức
                recipe.Ingredients.Add(new RecipeIngredientEntity
                {
                    IngredientId = existingIngredient.Id,
                    Amount = ingDto.Amount,
                    Unit = ingDto.Unit,
                    Note = ingDto.Note,
                    SortOrder = i
                });
            }

            // 3. Xử lý Các bước làm
            for (int i = 0; i < request.Steps.Count; i++)
            {
                recipe.InstructionSteps.Add(new InstructionStepEntity
                {
                    StepOrder = i + 1,
                    Content = request.Steps[i].Content,
                    ImageUrl = request.Steps[i].ImageUrl
                });
            }

             if (request.Tags != null && request.Tags.Any())
            {
                var distinctTags = request.Tags.Select(t => t.Trim().ToLower()).Distinct().ToList();
                foreach (var tagName in distinctTags)
                {
                    // Kiểm tra xem tag này đã có trong DB chưa
                    var existingTag = await _context.Tags.FirstOrDefaultAsync(t => t.Name.ToLower() == tagName);
                    if (existingTag == null)
                    {
                        // Nếu chưa có, tạo Tag mới
                        existingTag = new TagEntity 
                        { 
                            Name = tagName, 
                            // Có thể dùng một hàm viết sẵn hoặc thư viện để tạo Slug, VD: slugify
                            Slug = tagName.Replace(" ", "-") + "-" + Guid.NewGuid().ToString()[..4] 
                        };
                        _context.Tags.Add(existingTag);
                        await _context.SaveChangesAsync(); // Lưu để sinh Id
                    }

                    // Nối Tag với Recipe
                    recipe.RecipeTags.Add(new RecipeTagEntity { TagId = existingTag.Id });
                }
            }

            // 4. Lưu tất cả vào Database
            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            // Cập nhật số lượng bài viết của User
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.TotalRecipes += 1;
                await _context.SaveChangesAsync();
            }

            return (recipe.Id, recipe.Slug ?? string.Empty);
        }

        public async Task<List<RecipeSummaryResponse>> GetMyRecipesAsync(string userId)
        {
            return await _context.Recipes
                .Where(r => r.AuthorId == userId && !r.IsDeleted)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new RecipeSummaryResponse
                {
                    Id = r.Id,
                    Title = r.Title,
                    Slug = r.Slug,
                    CoverImageUrl = r.CoverImageUrl,
                    TotalTimeMinutes = r.PrepTimeMinutes + r.CookTimeMinutes,
                    FavoriteCount = r.FavoriteCount,
                    AuthorName = string.Empty, // Không cần hiển thị tên tác giả ở trang cá nhân
                    AuthorAvatar = string.Empty 
                    // Bạn có thể cân nhắc thêm thuộc tính Status (Bản nháp, Chờ duyệt, Đã duyệt) vào DTO này sau
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteRecipeAsync(int recipeId, string userId)
        {
            // Tìm công thức hợp lệ (đúng ID và đúng Tác giả)
            var recipe = await _context.Recipes
                .FirstOrDefaultAsync(r => r.Id == recipeId && r.AuthorId == userId && !r.IsDeleted);

            if (recipe == null) return false;

            // Thực hiện Xóa mềm (Soft Delete)
            recipe.IsDeleted = true;

            // Giảm số lượng công thức của User xuống
            var user = await _context.Users.FindAsync(userId);
            if (user != null && user.TotalRecipes > 0)
            {
                user.TotalRecipes -= 1;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateRecipeAsync(int recipeId, string userId, RecipeCreateRequest request)
        {
            var recipe = await _context.Recipes
                .Include(r => r.Ingredients)
                .Include(r => r.InstructionSteps)
                .FirstOrDefaultAsync(r => r.Id == recipeId && r.AuthorId == userId && !r.IsDeleted);

            if (recipe == null) return false;

            // 1. Cập nhật thông tin cơ bản
            recipe.Title = request.Title;
            recipe.Description = request.Description;
            recipe.CoverImageUrl = request.CoverImageUrl;
            recipe.CategoryId = request.CategoryId;
            recipe.PrepTimeMinutes = request.PrepTimeMinutes;
            recipe.CookTimeMinutes = request.CookTimeMinutes;
            recipe.Servings = request.Servings;
            recipe.Difficulty = request.Difficulty;
            recipe.UpdatedAt = DateTime.UtcNow;

            // 2. Xóa các liên kết Nguyên liệu & Bước làm cũ
            _context.RecipeIngredients.RemoveRange(recipe.Ingredients);
            _context.InstructionSteps.RemoveRange(recipe.InstructionSteps);
             _context.RecipeTags.RemoveRange(_context.RecipeTags.Where(rt => rt.RecipeId == recipeId));

            // 3. Thêm lại Nguyên liệu mới (y hệt luồng Create)
            var distinctIngredients = request.Ingredients
                .Where(i => !string.IsNullOrWhiteSpace(i.Name))
                .GroupBy(i => i.Name.Trim().ToLower())
                .Select(g => g.First())
                .ToList();

            foreach (var ingDto in distinctIngredients)
            {
                var ingredientName = ingDto.Name.Trim().ToLower();
                var existingIngredient = await _context.Ingredients
                    .FirstOrDefaultAsync(x => x.Name.ToLower() == ingredientName);

                if (existingIngredient == null)
                {
                    existingIngredient = new IngredientEntity { Name = ingDto.Name.Trim() };
                    _context.Ingredients.Add(existingIngredient);
                    await _context.SaveChangesAsync();
                }

                recipe.Ingredients.Add(new RecipeIngredientEntity
                {
                    IngredientId = existingIngredient.Id,
                    Amount = ingDto.Amount,
                    Unit = ingDto.Unit,
                    Note = ingDto.Note,
                    SortOrder = request.Ingredients.IndexOf(ingDto)
                });
            }

            // 4. Thêm lại Các bước làm mới
            for (int i = 0; i < request.Steps.Count; i++)
            {
                recipe.InstructionSteps.Add(new InstructionStepEntity
                {
                    StepOrder = i + 1,
                    Content = request.Steps[i].Content,
                    ImageUrl = request.Steps[i].ImageUrl
                });
            }

             if (request.Tags != null && request.Tags.Any())
            {
                var distinctTags = request.Tags.Select(t => t.Trim().ToLower()).Distinct().ToList();
                foreach (var tagName in distinctTags)
                {
                    // Kiểm tra xem tag này đã có trong DB chưa
                    var existingTag = await _context.Tags.FirstOrDefaultAsync(t => t.Name.ToLower() == tagName);
                    if (existingTag == null)
                    {
                        // Nếu chưa có, tạo Tag mới
                        existingTag = new TagEntity 
                        { 
                            Name = tagName, 
                            // Có thể dùng một hàm viết sẵn hoặc thư viện để tạo Slug, VD: slugify
                            Slug = tagName.Replace(" ", "-") + "-" + Guid.NewGuid().ToString()[..4] 
                        };
                        _context.Tags.Add(existingTag);
                        await _context.SaveChangesAsync(); // Lưu để sinh Id
                    }

                    // Nối Tag với Recipe
                    recipe.RecipeTags.Add(new RecipeTagEntity { TagId = existingTag.Id });
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Hàm hỗ trợ tạo URL thân thiện (Slug)
        private string GenerateSlug(string phrase)
        {
            string str = phrase.ToLower();
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = Regex.Replace(str, @"\s+", " ").Trim();
            str = str.Substring(0, str.Length <= 45 ? str.Length : 45).Trim();
            str = Regex.Replace(str, @"\s", "-");
            return str;
        }

        public async Task<RecipeDetailResponse?> GetRecipeBySlugAsync(string slug, string? currentUserId = null)
        {
            // Tìm kiếm công thức kèm theo nạp các bảng liên quan (Eager Loading)
           var recipe = await _context.Recipes
                .Include(r => r.Author)
                .Include(r => r.Category)
                .Include(r => r.InstructionSteps)
                .Include(r => r.RecipeTags).ThenInclude(rt => rt.Tag)
                .Include(r => r.Ingredients).ThenInclude(ri => ri.Ingredient)
                .FirstOrDefaultAsync(r => r.Slug == slug && !r.IsDeleted);

            if (recipe == null) return null;

            bool isFavorited = false;
            bool isFollowing = false;
            int? currentUserRating = null;

            if (!string.IsNullOrEmpty(currentUserId))
            {
                // Check bảng Favorites
                isFavorited = await _context.Favorites
                    .AnyAsync(f => f.UserId == currentUserId && f.RecipeId == recipe.Id);
                    
                // Check bảng UserFollows (không tính trường hợp tự xem bài mình)
                if (currentUserId != recipe.AuthorId)
                {
                    isFollowing = await _context.UserFollows
                        .AnyAsync(uf => uf.FollowerId == currentUserId && uf.FollowedId == recipe.AuthorId);
                }

                var rating = await _context.Ratings.FirstOrDefaultAsync(r => r.UserId == currentUserId && r.RecipeId == recipe.Id);
                if (rating != null) currentUserRating = rating.StarCount;
            }

            // Ánh xạ dữ liệu sang DTO trả về
            return new RecipeDetailResponse
            {
                Id = recipe.Id,
                Title = recipe.Title,
                Description = recipe.Description,
                CoverImageUrl = recipe.CoverImageUrl,
                PrepTimeMinutes = recipe.PrepTimeMinutes,
                CookTimeMinutes = recipe.CookTimeMinutes,
                Servings = recipe.Servings,
                Difficulty = recipe.Difficulty,
                Cuisine = recipe.Cuisine,
                YoutubeVideoUrl = recipe.YoutubeVideoUrl,
                Slug = recipe.Slug,
                CreatedAt = recipe.CreatedAt,
                AuthorId = recipe.AuthorId,
                AuthorName = recipe.Author!.DisplayName,
                AuthorAvatar = recipe.Author.AvatarUrl,
                CategoryName = recipe.Category?.Name,
                CategoryId = recipe.CategoryId,
                CommentCount = recipe.CommentCount,
                AverageRating = recipe.AverageRating,
                AuthorFollowers = recipe.Author!.TotalFollowers,
                IsFavorited = isFavorited,
                IsFollowing = isFollowing,
                FavoriteCount = recipe.FavoriteCount,
                CurrentUserRating = currentUserRating,
        
                // Map mảng Tag
                Tags = recipe.RecipeTags.Select(rt => rt.Tag!.Name).ToList(),
                
                Ingredients = recipe.Ingredients
                    .OrderBy(ri => ri.SortOrder)
                    .Select(ri => new RecipeIngredientDetailDto
                    {
                        IngredientId = ri.IngredientId,
                        Name = ri.Ingredient!.Name,
                        Amount = ri.Amount,
                        Unit = ri.Unit,
                        Note = ri.Note
                    }).ToList(),
                    
                Steps = recipe.InstructionSteps
                    .OrderBy(s => s.StepOrder)
                    .Select(s => new InstructionStepDetailDto
                    {
                        Id = s.Id,
                        StepOrder = s.StepOrder,
                        Content = s.Content,
                        ImageUrl = s.ImageUrl
                    }).ToList()
            };
        }
    }

    
}
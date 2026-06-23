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

        public async Task<RecipeDetailResponse?> GetRecipeBySlugAsync(string slug)
        {
            // Tìm kiếm công thức kèm theo nạp các bảng liên quan (Eager Loading)
            var recipe = await _context.Recipes
                .Include(r => r.Author)
                .Include(r => r.Category)
                .Include(r => r.InstructionSteps)
                .Include(r => r.Ingredients)
                    .ThenInclude(ri => ri.Ingredient) // Chọc từ bảng trung gian vào bảng nguyên liệu gốc để lấy Name
                .FirstOrDefaultAsync(r => r.Slug == slug && !r.IsDeleted);

            if (recipe == null) return null;

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
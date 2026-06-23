using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeApp.API.Features.Recipes.DTOs;
using System.Security.Claims;

namespace RecipeApp.API.Features.Recipes
{
    [ApiController]
    [Route("api/features/[controller]")]
    public class RecipesController : ControllerBase
    {
        private readonly RecipeService _recipeService;

        public RecipesController(RecipeService recipeService)
        {
            _recipeService = recipeService;
        }

        // GET: /api/features/recipes
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var recipes = await _recipeService.GetAllRecipesAsync();
            return Ok(recipes);
        }

        // POST: /api/features/recipes
        [Authorize] // Bắt buộc phải đăng nhập mới được viết bài
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RecipeCreateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Không thể định danh người dùng." });
            }

            try
            {
                var (recipeId, slug) = await _recipeService.CreateRecipeAsync(userId, request);
                return Ok(new { Message = "Đăng công thức thành công!", RecipeId = recipeId, Slug = slug });
            }
            catch (Exception ex)
            {
                // Ở môi trường thực tế nên dùng ILogger để ghi lại lỗi
                return StatusCode(500, new { Message = "Có lỗi xảy ra khi lưu công thức.", Detail = ex.Message });
            }
        }
   
        [HttpGet("{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            if (string.IsNullOrEmpty(slug))
            {
                return BadRequest(new { Message = "Đường dẫn công thức không hợp lệ." });
            }

            var recipe = await _recipeService.GetRecipeBySlugAsync(slug);
            
            if (recipe == null)
            {
                return NotFound(new { Message = "Không tìm thấy công thức nấu ăn yêu cầu hoặc bài viết đã bị xóa." });
            }

            return Ok(recipe);
        }
    }
}
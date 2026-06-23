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
   
        [Authorize] // Bắt buộc đăng nhập
        [HttpGet("my-recipes")]
        public async Task<IActionResult> GetMyRecipes()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Không thể định danh người dùng." });
            }

            var recipes = await _recipeService.GetMyRecipesAsync(userId);
            return Ok(recipes);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Không thể định danh người dùng." });
            }

            var success = await _recipeService.DeleteRecipeAsync(id, userId);
            
            if (!success)
            {
                // Có thể do ID không tồn tại, hoặc user này không phải là tác giả của bài viết
                return BadRequest(new { Message = "Không thể xóa công thức. Bạn không có quyền hoặc bài viết không tồn tại." });
            }

            return Ok(new { Message = "Đã xóa công thức thành công." });
        }

        // PUT: /api/features/recipes/{id}
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] RecipeCreateRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized(new { Message = "Lỗi xác thực." });

            try
            {
                var success = await _recipeService.UpdateRecipeAsync(id, userId, request);
                if (!success) return BadRequest(new { Message = "Không thể cập nhật. Bài viết không tồn tại hoặc bạn không có quyền." });

                return Ok(new { Message = "Cập nhật công thức thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Có lỗi xảy ra khi cập nhật.", Detail = ex.Message });
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
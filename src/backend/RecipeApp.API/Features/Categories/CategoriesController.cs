using Microsoft.AspNetCore.Mvc;

namespace RecipeApp.API.Features.Categories
{
    [ApiController]
    [Route("api/features/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoryService _categoryService;

        public CategoriesController(CategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetActiveCategoriesAsync();
            return Ok(categories);
        }
    }
}
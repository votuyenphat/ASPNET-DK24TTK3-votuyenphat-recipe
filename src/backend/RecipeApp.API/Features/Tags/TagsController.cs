using Microsoft.AspNetCore.Mvc;

namespace RecipeApp.API.Features.Tags
{
    [ApiController]
    [Route("api/features/[controller]")]
    public class TagsController : ControllerBase
    {
        private readonly TagService _tagService;

        public TagsController(TagService tagService)
        {
            _tagService = tagService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPopular()
        {
            var tags = await _tagService.GetPopularTagsAsync();
            return Ok(tags);
        }
    }
}
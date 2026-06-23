using Microsoft.AspNetCore.Mvc;
using RecipeApp.API.Features.Search.DTOs;

namespace RecipeApp.API.Features.Search
{
    [ApiController]
    [Route("api/features/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly SearchService _searchService;

        public SearchController(SearchService searchService)
        {
            _searchService = searchService;
        }

        [HttpGet("suggest")]
        public async Task<IActionResult> GetSuggestions([FromQuery] string q)
        {
            var results = await _searchService.GetSuggestionsAsync(q);
            return Ok(results);
        }

        [HttpGet("advanced")]
        public async Task<IActionResult> AdvancedSearch([FromQuery] AdvancedSearchRequest request)
        {
            var (items, totalCount) = await _searchService.AdvancedSearchAsync(request);
            
            return Ok(new {
                Data = items,
                TotalCount = totalCount,
                CurrentPage = request.Page,
                TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
            });
        }
    }
}
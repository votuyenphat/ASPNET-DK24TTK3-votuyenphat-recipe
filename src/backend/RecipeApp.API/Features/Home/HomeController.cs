using Microsoft.AspNetCore.Mvc;

namespace RecipeApp.API.Features.Home
{
    [ApiController]
    [Route("api/features/[controller]")]
    public class HomeController : ControllerBase
    {
        private readonly HomeService _homeService;

        public HomeController(HomeService homeService)
        {
            _homeService = homeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetHomeData()
        {
            var data = await _homeService.GetHomePageDataAsync();
            return Ok(data);
        }
    }
}
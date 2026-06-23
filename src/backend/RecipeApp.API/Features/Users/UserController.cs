using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace RecipeApp.API.Features.Users
{
    [Authorize] // Bắt buộc phải đăng nhập mới dùng được các API trong này
    [ApiController]
    [Route("api/features/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Không thể định danh người dùng." });
            }

            var profile = await _userService.GetProfileByIdAsync(userId);
            if (profile == null)
            {
                return NotFound(new { Message = "Không tìm thấy thông tin người dùng." });
            }

            return Ok(profile);
        }
    }
}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeApp.API.Features.Users.DTOs;
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

        [Authorize]
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.DisplayName))
            {
                return BadRequest(new { Message = "Tên hiển thị không được để trống." });
            }

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var success = await _userService.UpdateProfileAsync(userId, request);
            if (!success) return BadRequest(new { Message = "Không tìm thấy người dùng." });

            return Ok(new { 
                Message = "Cập nhật hồ sơ thành công!",
                // Trả về thông tin mới để Frontend cập nhật localStorage
                User = new {
                    DisplayName = request.DisplayName,
                    AvatarUrl = request.AvatarUrl,
                }
            });
        }

        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetPublicProfile(string userId)
        {
            // Lấy ID người đang xem (có thể rỗng nếu khách vãng lai)
            var currentViewerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var profile = await _userService.GetPublicProfileAsync(userId, currentViewerId);
            if (profile == null) return NotFound(new { Message = "Không tìm thấy đầu bếp này." });

            return Ok(profile);
        }
    }
}
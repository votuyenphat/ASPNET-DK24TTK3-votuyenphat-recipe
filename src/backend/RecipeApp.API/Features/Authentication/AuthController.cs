using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RecipeApp.API.Features.Authentication.DTOs;
using RecipeApp.API.Infrastructure.Database.Entities;

namespace RecipeApp.API.Features.Authentication
{
    [ApiController]
    [Route("api/features/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<UserEntity> _userManager;
        public AuthController(AuthService authService, RoleManager<IdentityRole> roleManager, UserManager<UserEntity> userManager)
        {
            _authService = authService;
            _roleManager = roleManager;
            _userManager = userManager;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);
            if (result == null)
            {
                return Unauthorized(new { Message = "Email hoặc mật khẩu không chính xác." });
            }

            return Ok(result);
        }
    

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
            var result = await _authService.RegisterAsync(request);
            
            if (string.IsNullOrEmpty(result.Token))
            {
                return BadRequest(new { Message = result.Message });
            }

            return Ok(result);
    }
    

    [HttpPost("make-me-admin")]
    public async Task<IActionResult> MakeMeAdmin([FromQuery] string email)
    {
        // 1. Kiểm tra xem Role "Admin" đã tồn tại trong bảng AspNetRoles chưa. Chưa thì tạo!
        if (!await _roleManager.RoleExistsAsync("Admin"))
        {
            await _roleManager.CreateAsync(new IdentityRole("Admin"));
        }

        // 2. Tìm tài khoản của bạn theo Email
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound("Không tìm thấy user.");

        // 3. Gán quyền Admin cho user này
        if (!await _userManager.IsInRoleAsync(user, "Admin"))
        {
            await _userManager.AddToRoleAsync(user, "Admin");
            return Ok($"Thành công! Tài khoản {email} đã trở thành Admin tối cao.");
        }

        return Ok("Tài khoản này vốn đã là Admin rồi.");
        }
    }
}

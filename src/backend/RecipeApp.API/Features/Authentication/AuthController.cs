using Microsoft.AspNetCore.Mvc;
using RecipeApp.API.Features.Authentication.DTOs;

namespace RecipeApp.API.Features.Authentication
{
    [ApiController]
    [Route("api/features/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
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
    }
}
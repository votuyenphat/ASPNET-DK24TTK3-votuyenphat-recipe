using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RecipeApp.API.Features.Authentication.DTOs;
using RecipeApp.API.Infrastructure.Database;
using RecipeApp.API.Infrastructure.Database.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace RecipeApp.API.Features.Authentication
{

    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly UserManager<UserEntity> _userManager;

        public AuthService(AppDbContext context, IConfiguration configuration, UserManager<UserEntity> userManager)
        {
            _context = context;
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task<AuthResponse?> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            {
                return null;
            }

            var roles = await _userManager.GetRolesAsync(user);
            // Nếu user chưa được gán role nào trong DB, mặc định coi là "User"
            var primaryRole = roles.FirstOrDefault() ?? "User";

            return new AuthResponse 
            { 
                Token = GenerateJwtToken(user, primaryRole),
                Message = "Đăng nhập thành công",
                Role = primaryRole
            };
        }
    
        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return new AuthResponse { Token = string.Empty, Message = "Email này đã được sử dụng." };
            }

            var newUser = new UserEntity
            {
                UserName = request.Email, // Identity bắt buộc có UserName, ta dùng Email luôn
                Email = request.Email,
                DisplayName = request.DisplayName,
                CreatedAt = DateTime.UtcNow
            };

            // CreateAsync sẽ tự động băm mật khẩu và lưu vào DB
            var result = await _userManager.CreateAsync(newUser, request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return new AuthResponse { Token = string.Empty, Message = $"Đăng ký thất bại: {errors}" };
            }

            return new AuthResponse 
            { 
                Token = GenerateJwtToken(newUser),
                Message = "Đăng ký thành công"
            };
        }

        private string GenerateJwtToken(UserEntity user, string? primaryRole = null)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:SecretKey"]!);
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id), // IdentityUser dùng string Id
                    new Claim(ClaimTypes.Email, user.Email!),
                    new Claim(ClaimTypes.Role, primaryRole), // Lấy role đầu tiên hoặc mặc định "User",
                }),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["JwtSettings:ExpiryMinutes"]!)),
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"],

                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
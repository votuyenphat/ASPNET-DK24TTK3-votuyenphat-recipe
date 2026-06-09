namespace RecipeApp.API.Features.Authentication.DTOs
{
    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
using Microsoft.AspNetCore.Http;

namespace RecipeApp.API.Features.Uploads
{
    public class UploadService
    {
        private readonly IWebHostEnvironment _env;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UploadService(IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor)
        {
            _env = env;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folderName = "recipes")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File không hợp lệ hoặc bị rỗng.");

            // 1. Kiểm tra định dạng (Chỉ cho phép ảnh)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            
            if (!allowedExtensions.Contains(extension))
                throw new ArgumentException("Chỉ chấp nhận file ảnh định dạng .jpg, .jpeg, .png, .webp.");

            // Giới hạn dung lượng (ví dụ: tối đa 5MB)
            if (file.Length > 5 * 1024 * 1024)
                throw new ArgumentException("Kích thước ảnh tối đa là 5MB.");

            // 2. Xác định thư mục lưu trữ (Tạo wwwroot/uploads/recipes nếu chưa có)
            var webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = Path.Combine(webRootPath, "uploads", folderName);
            
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // 3. Đổi tên file bằng Guid để đảm bảo không bao giờ trùng lặp
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // 4. Lưu file vật lý xuống ổ cứng server
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // 5. Trả về URL đầy đủ (Ví dụ: https://localhost:7198/uploads/recipes/abc-123.jpg)
            var request = _httpContextAccessor.HttpContext!.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}";
            
            return $"{baseUrl}/uploads/{folderName}/{uniqueFileName}";
        }
    }
}
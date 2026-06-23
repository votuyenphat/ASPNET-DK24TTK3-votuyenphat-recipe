using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace RecipeApp.API.Features.Uploads
{
    [Authorize] // Bắt buộc đăng nhập để chống spam upload
    [ApiController]
    [Route("api/features/[controller]")]
    public class UploadsController : ControllerBase
    {
        private readonly UploadService _uploadService;

        public UploadsController(UploadService uploadService)
        {
            _uploadService = uploadService;
        }

        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            try
            {
                var imageUrl = await _uploadService.UploadImageAsync(file);
                
                // Trả về URL của ảnh để Frontend hiển thị và gắn vào Form
                return Ok(new { Url = imageUrl });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Ghi log lỗi ex.Message ở đây nếu có hệ thống log
                return StatusCode(500, new { Message = "Đã xảy ra lỗi hệ thống khi lưu ảnh." });
            }
        }
    }
}
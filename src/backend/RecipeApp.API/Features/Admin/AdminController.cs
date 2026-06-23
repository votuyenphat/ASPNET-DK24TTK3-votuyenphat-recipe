using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeApp.API.Features.Admin.DTOs;

namespace RecipeApp.API.Features.Admin
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin")] // Kích hoạt khi có Token chứa Role
    public class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;

        public AdminController(AdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("dashboard/overview")]
        public async Task<IActionResult> GetDashboardOverview()
        {
            return Ok(await _adminService.GetOverviewStatsAsync());
        }

        // ------------------ API BENTO GRID ------------------
        [HttpPost("bento-config")]
        public async Task<IActionResult> UpdateBentoConfig([FromBody] BentoSettingsRequest request)
        {
            await _adminService.UpdateBentoConfigAsync(request);
            return Ok(new { Message = "Đã cập nhật cấu hình BentoGrid thành công." });
        }

        [AllowAnonymous]
        [HttpGet("bento-data")] // API này trang chủ gọi
        public async Task<IActionResult> GetBentoData()
        {
            return Ok(await _adminService.GetLiveBentoDataAsync());
        }

        // ------------------ API CATEGORIES ------------------
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories() => Ok(await _adminService.GetCategoriesAdminAsync());

        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryRequest request)
        {
            var success = await _adminService.CreateCategoryAsync(request);
            if (!success) return BadRequest(new { Message = "Danh mục này hoặc slug đã tồn tại." });
            return Ok(new { Message = "Đã thêm danh mục mới." });
        }

        [HttpPut("categories/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryRequest request)
        {
            var success = await _adminService.UpdateCategoryAsync(id, request);
            if (!success) return NotFound();
            return Ok(new { Message = "Đã cập nhật danh mục." });
        }

        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var success = await _adminService.DeleteCategoryAsync(id);
                if (!success) return NotFound();
                return Ok(new { Message = "Đã xóa danh mục." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // ------------------ API TAGS ------------------
        [HttpGet("tags")]
        public async Task<IActionResult> GetTags() => Ok(await _adminService.GetTagsAdminAsync());

        [HttpPut("tags/{id}")]
        public async Task<IActionResult> UpdateTag(int id, [FromBody] TagRequest request)
        {
            var success = await _adminService.UpdateTagAsync(id, request);
            if (!success) return NotFound();
            return Ok(new { Message = "Đã cập nhật thẻ." });
        }

        [HttpDelete("tags/{id}")]
        public async Task<IActionResult> DeleteTag(int id)
        {
            var success = await _adminService.DeleteTagAsync(id);
            if (!success) return NotFound();
            return Ok(new { Message = "Đã xóa thẻ." });
        }

        // ------------------ API RECIPE STATUS ------------------
        [HttpGet("recipes")]
        public async Task<IActionResult> GetAllRecipesAdmin()
        {
            // Đã thay thế hàm cũ bằng hàm GetAllRecipesAdminAsync xịn xò
            return Ok(await _adminService.GetAllRecipesAdminAsync()); 
        }

        [HttpPut("recipes/{id}/status")]
        public async Task<IActionResult> ChangeRecipeStatus(int id, [FromBody] UpdateRecipeStatusRequest request)
        {
            var success = await _adminService.ToggleRecipeStatusAsync(id, request.IsDeleted);
            if (!success) return NotFound(new { Message = "Không tìm thấy công thức." });
            
            return Ok(new { Message = request.IsDeleted ? "Đã khóa bài viết" : "Đã mở khóa bài viết" });
        }

        [HttpGet("recipes-lookup")]
        public async Task<IActionResult> GetRecipesLookup()
        {
            return Ok(await _adminService.GetRecipesLookupAsync());
        }

        [HttpGet("chefs-lookup")]
        public async Task<IActionResult> GetChefsLookup()
        {
            return Ok(await _adminService.GetChefsLookupAsync());
        }

        [HttpGet("bento-config-raw")] 
        public async Task<IActionResult> GetBentoConfigRaw()
        {
            // SỬA TẠI ĐÂY: Trả về cấu hình thô thay vì dữ liệu live đã biên dịch
            return Ok(await _adminService.GetRawBentoConfigAsync()); 
        }

        // ------------------ API SPONSORED CAMPAIGNS ------------------
        [HttpGet("sponsors")]
        public async Task<IActionResult> GetSponsors() => Ok(await _adminService.GetAllSponsorsAsync());

        [HttpPost("sponsors")]
        public async Task<IActionResult> CreateSponsor([FromBody] SponsoredCampaignRequest request)
        {
            await _adminService.CreateSponsorAsync(request);
            return Ok(new { Message = "Đã tạo chiến dịch tài trợ." });
        }

        [HttpPut("sponsors/{id}")]
        public async Task<IActionResult> UpdateSponsor(int id, [FromBody] SponsoredCampaignRequest request)
        {
            var success = await _adminService.UpdateSponsorAsync(id, request);
            if (!success) return NotFound();
            return Ok(new { Message = "Đã cập nhật chiến dịch." });
        }

        [HttpPut("sponsors/{id}/status")]
        public async Task<IActionResult> ChangeSponsorStatus(int id, [FromBody] UpdateSponsorStatusRequest request)
        {
            var success = await _adminService.ToggleSponsorStatusAsync(id, request.IsActive);
            if (!success) return NotFound();
            return Ok(new { Message = "Đã thay đổi trạng thái hoạt động." });
        }

        [HttpDelete("sponsors/{id}")]
        public async Task<IActionResult> DeleteSponsor(int id)
        {
            var success = await _adminService.DeleteSponsorAsync(id);
            if (!success) return NotFound();
            return Ok(new { Message = "Đã xóa chiến dịch." });
        }

        [HttpGet("challenges")]
        public async Task<IActionResult> GetChallenges() => Ok(await _adminService.GetAllChallengesAsync());

        [HttpGet("challenges-lookup")]
        public async Task<IActionResult> GetChallengesLookup() => Ok(await _adminService.GetChallengesLookupAsync());

        [HttpPost("challenges")]
        public async Task<IActionResult> CreateChallenge([FromBody] ChallengeRequest request)
        {
            await _adminService.CreateChallengeAsync(request);
            return Ok(new { Message = "Đã tạo thử thách mới." });
        }

        [HttpPut("challenges/{id}")]
        public async Task<IActionResult> UpdateChallenge(int id, [FromBody] ChallengeRequest request)
        {
            var success = await _adminService.UpdateChallengeAsync(id, request);
            if (!success) return NotFound();
            return Ok(new { Message = "Đã cập nhật thử thách." });
        }

        [HttpPut("challenges/{id}/status")]
        public async Task<IActionResult> ChangeChallengeStatus(int id, [FromBody] UpdateChallengeStatusRequest request)
        {
            var success = await _adminService.ToggleChallengeStatusAsync(id, request.IsActive);
            if (!success) return NotFound();
            return Ok(new { Message = "Đã đổi trạng thái thử thách." });
        }

        [HttpDelete("challenges/{id}")]
        public async Task<IActionResult> DeleteChallenge(int id)
        {
            var success = await _adminService.DeleteChallengeAsync(id);
            if (!success) return NotFound();
            return Ok(new { Message = "Đã xóa thử thách." });
        }
    }
}
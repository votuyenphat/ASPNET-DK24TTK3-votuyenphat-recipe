using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeApp.API.Features.Interactions.DTOs;
using System.Security.Claims;

namespace RecipeApp.API.Features.Interactions
{
    [ApiController]
    [Route("api/features/[controller]")]
    public class InteractionsController : ControllerBase
    {
        private readonly InteractionService _interactionService;

        public InteractionsController(InteractionService interactionService)
        {
            _interactionService = interactionService;
        }

        private string? GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        [Authorize]
        [HttpPost("recipes/{recipeId}/favorite")]
        public async Task<IActionResult> ToggleFavorite(int recipeId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var result = await _interactionService.ToggleFavoriteAsync(userId, recipeId);
            if (!result) return NotFound(new { Message = "Không tìm thấy công thức." });

            return Ok(new { Message = "Đã cập nhật trạng thái yêu thích." });
        }

        [Authorize]
        [HttpPost("users/{followedId}/follow")]
        public async Task<IActionResult> ToggleFollow(string followedId)
        {
            var followerId = GetUserId();
            if (followerId == null) return Unauthorized();

            try
            {
                var result = await _interactionService.ToggleFollowAsync(followerId, followedId);
                if (!result) return NotFound(new { Message = "Không tìm thấy tác giả." });
                return Ok(new { Message = "Đã cập nhật trạng thái theo dõi." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("recipes/{recipeId}/rate")]
        public async Task<IActionResult> RateRecipe(int recipeId, [FromBody] RatingRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            try
            {
                var result = await _interactionService.RateRecipeAsync(userId, recipeId, request.StarCount);
                if (!result) return NotFound(new { Message = "Không tìm thấy công thức." });
                return Ok(new { Message = "Đánh giá của bạn đã được ghi nhận." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("recipes/{recipeId}/comments")]
        public async Task<IActionResult> AddComment(int recipeId, [FromBody] CommentRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var comment = await _interactionService.AddCommentAsync(userId, recipeId, request);
            if (comment == null) return NotFound(new { Message = "Không tìm thấy công thức." });

            return Ok(comment);
        }

        // Lấy bình luận không cần đăng nhập
        [HttpGet("recipes/{recipeId}/comments")]
        public async Task<IActionResult> GetComments(int recipeId)
        {
            var comments = await _interactionService.GetCommentsAsync(recipeId);
            return Ok(comments);
        }

        [Authorize]
        [HttpPut("comments/{commentId}")]
        public async Task<IActionResult> UpdateComment(int commentId, [FromBody] CommentRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var success = await _interactionService.UpdateCommentAsync(commentId, userId, request.Content);
            if (!success) return BadRequest(new { Message = "Không thể sửa. Bạn không có quyền hoặc bình luận đã bị xóa." });

            return Ok(new { Message = "Đã cập nhật bình luận." });
        }

        [Authorize]
        [HttpDelete("comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var success = await _interactionService.DeleteCommentAsync(commentId, userId);
            if (!success) return BadRequest(new { Message = "Không thể xóa. Bạn không có quyền hoặc bình luận đã bị xóa." });

            return Ok(new { Message = "Đã xóa bình luận." });
        }
    }
}
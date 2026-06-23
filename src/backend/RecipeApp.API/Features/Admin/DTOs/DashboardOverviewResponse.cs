using System;
using System.Collections.Generic;

namespace RecipeApp.API.Features.Admin.DTOs
{
    // ==========================================
    // DTO DASHBOARD TỔNG QUAN
    // ==========================================
    public class DashboardOverviewResponse
    {
        public int TotalUsers { get; set; }
        public int TotalRecipes { get; set; }
        public int TotalComments { get; set; }
        public int ActiveSponsors { get; set; }
        
        public List<AdminRecipeSummaryDto> RecentRecipes { get; set; } = new();
        public List<CategoryStatDto> CategoryBreakdown { get; set; } = new();
        public List<DailyStatDto> InteractionChart { get; set; } = new();
    }

    public class AdminRecipeSummaryDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int FavoriteCount { get; set; }
        public bool IsDeleted { get; set; } 
    }

    public class CategoryStatDto
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class DailyStatDto
    {
        public string DateLabel { get; set; } = string.Empty; 
        public int Count { get; set; }
    }

    // ==========================================
    // DTO CRUD CATEGORY, TAG, RECIPE
    // ==========================================
    public class CategoryRequest
    {
        public string Name { get; set; } = string.Empty;
    }

    public class TagRequest
    {
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateRecipeStatusRequest
    {
        public bool IsDeleted { get; set; } 
    }

    // ==========================================
    // DTO CẤU HÌNH BENTO GRID
    // ==========================================
    public class BentoSettingsRequest
    {
        public string HeroMode { get; set; } = "auto"; 
        public int? HeroRecipeId { get; set; } 
        public string SponsoredRecipeIds { get; set; } = string.Empty; 
        public string ChefMode { get; set; } = "auto";
        public string? ChefUserId { get; set; }
        public string KitchenTip { get; set; } = string.Empty;
        public string ChallengeTitle { get; set; } = string.Empty;
        public string ChallengeDesc { get; set; } = string.Empty;

        public string ChallengeMode { get; set; } = "auto"; // "auto" hoặc "manual"
        public int? ChallengeId { get; set; }
    }

    public class BentoLiveResponse
    {
        public object? HeroRecipe { get; set; }
        public List<object> SponsoredRecipes { get; set; } = new();
        public object? TopChef { get; set; }
        public List<string> HotTags { get; set; } = new();
        public string KitchenTip { get; set; } = string.Empty;
        public object Challenge { get; set; } = new();
    }

    public class SponsoredCampaignRequest
    {
        public string Title { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string TargetUrl { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdateSponsorStatusRequest
    {
        public bool IsActive { get; set; }
    }

    // Cấu hình yêu cầu gửi lên cho Challenge
    public class ChallengeRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TagName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
    }

    public class UpdateChallengeStatusRequest { public bool IsActive { get; set; } }
}
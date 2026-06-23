using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Features.Categories.DTOs;
using RecipeApp.API.Infrastructure.Database;

namespace RecipeApp.API.Features.Categories
{
    public class CategoryService
    {
        private readonly AppDbContext _context;

        public CategoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<CategoryResponse>> GetActiveCategoriesAsync()
        {
            return await _context.Categories
                .OrderBy(c => c.SortOrder)
                .Select(c => new CategoryResponse
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description,
                    IconUrl = c.IconUrl
                })
                .ToListAsync();
        }
    }
}
using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Features.Tags.DTOs;
using RecipeApp.API.Infrastructure.Database;

namespace RecipeApp.API.Features.Tags
{
    public class TagService
    {
        private readonly AppDbContext _context;

        public TagService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TagResponse>> GetPopularTagsAsync()
        {
            // Lấy ra danh sách các tag thịnh hành
            return await _context.Tags
                .Take(20)
                .Select(t => new TagResponse
                {
                    Id = t.Id,
                    Name = t.Name,
                    Slug = t.Slug
                })
                .ToListAsync();
        }
    }
}
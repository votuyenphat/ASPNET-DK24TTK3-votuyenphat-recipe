using RecipeApp.API.Infrastructure.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace RecipeApp.API.Infrastructure.Database
{
    public class AppDbContext : IdentityDbContext<UserEntity>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<CategoryEntity> Categories { get; set; }
        public DbSet<RecipeEntity> Recipes { get; set; }
        public DbSet<IngredientEntity> Ingredients { get; set; }
        public DbSet<RecipeIngredientEntity> RecipeIngredients { get; set; }
        public DbSet<InstructionStepEntity> InstructionSteps { get; set; }
        public DbSet<TagEntity> Tags { get; set; }
        public DbSet<RecipeTagEntity> RecipeTags { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<UserEntity>(entity =>
            {
                entity.HasIndex(u => u.UserName).IsUnique();
                entity.HasIndex(u => u.Email).IsUnique();
            });

            // Cấu hình Unique Index cho Category và Ingredient
            builder.Entity<CategoryEntity>().HasIndex(c => c.Slug).IsUnique();
            builder.Entity<IngredientEntity>().HasIndex(i => i.Name).IsUnique();
            builder.Entity<RecipeEntity>().HasIndex(r => r.Slug).IsUnique();
            builder.Entity<TagEntity>().HasIndex(t => t.Slug).IsUnique();
            builder.Entity<TagEntity>().HasIndex(t => t.Name).IsUnique();   

            // Cấu hình khóa chính kép cho bảng RecipeIngredients
            builder.Entity<RecipeIngredientEntity>()
                .HasKey(ri => new { ri.RecipeId, ri.IngredientId });

            // Cấu hình quan hệ User - Recipe (Tránh lỗi Cascade Delete của SQL Server)
            builder.Entity<RecipeEntity>()
                .HasOne(r => r.Author)
                .WithMany(u => u.Recipes)
                .HasForeignKey(r => r.AuthorId)
                .OnDelete(DeleteBehavior.Restrict); // Khi xóa User thì không tự động xóa Recipe để tránh mất data cộng đồng
                
            // Cấu hình quan hệ Category - Recipe
            builder.Entity<RecipeEntity>()
                .HasOne(r => r.Category)
                .WithMany(c => c.Recipes)
                .HasForeignKey(r => r.CategoryId)
                .OnDelete(DeleteBehavior.SetNull); // Khi xóa Category, Recipe sẽ mang CategoryId = null

            builder.Entity<RecipeTagEntity>().HasKey(rt => new { rt.RecipeId, rt.TagId });
        }
    }
}
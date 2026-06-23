using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RecipeApp.API.Features.Admin;
using RecipeApp.API.Features.Authentication;
using RecipeApp.API.Features.Categories;
using RecipeApp.API.Features.Home;
using RecipeApp.API.Features.Interactions;
using RecipeApp.API.Features.Recipes;
using RecipeApp.API.Features.Search;
using RecipeApp.API.Features.Tags;
using RecipeApp.API.Features.Uploads;
using RecipeApp.API.Features.Users;
using RecipeApp.API.Infrastructure.Database;
using RecipeApp.API.Infrastructure.Database.Entities;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtKey = builder.Configuration["JwtSettings:SecretKey"];

builder.Services.AddIdentity<UserEntity, IdentityRole>(options =>
{
    // Tùy chỉnh rule cho Password (để dễ test dữ liệu mẫu)
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
    
    // Cấu hình User
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey!)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Đổi lại đúng URL của React App nếu bạn dùng port khác
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<RecipeService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<TagService>();
builder.Services.AddScoped<UploadService>();
builder.Services.AddScoped<InteractionService>();
builder.Services.AddScoped<SearchService>();
builder.Services.AddScoped<HomeService>();
builder.Services.AddScoped<AdminService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    
    // Kiểm tra xem đã có dữ liệu chưa, nếu chưa thì chèn danh mục mẫu
    if (!context.Categories.Any())
    {
        context.Categories.AddRange(
            new CategoryEntity { Name = "Món Khai Vị", Slug = "mon-khai-vi", SortOrder = 1 },
            new CategoryEntity { Name = "Món Kho", Slug = "mon-kho", SortOrder = 2 },
            new CategoryEntity { Name = "Món Canh", Slug = "mon-canh", SortOrder = 3 },
            new CategoryEntity { Name = "Món Xào", Slug = "mon-xiao", SortOrder = 4 },
            new CategoryEntity { Name = "Bánh & Đồ Ngọt", Slug = "banh-do-ngot", SortOrder = 5 }
        );
        context.SaveChanges();
    }

    // Chèn tag mẫu
    if (!context.Tags.Any())
    {
        context.Tags.AddRange(
            new TagEntity { Name = "Món Ngon Mỗi Ngày", Slug = "mon-ngon-moi-ngay" },
            new TagEntity { Name = "Ăn Sáng", Slug = "an-sang" },
            new TagEntity { Name = "Giảm Cân", Slug = "giam-can" },
            new TagEntity { Name = "Dễ Làm", Slug = "de-lam" }
        );
        context.SaveChanges();
    }
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowReactApp"); // Bật CORS với policy đã định nghĩa
app.UseAuthentication(); // Bật Authentication middleware
app.UseAuthorization();
app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

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

app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

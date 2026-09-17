using API.Data;
using API.Interfaces;
using API.Services;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddControllers();
            services.AddDbContext<DataContext>(opt =>
            {
                opt.UseSqlServer(config.GetConnectionString("dbConnection"));
            });

            //Register IHttpContextAccessor first
            services.AddHttpContextAccessor(); // cannot use IHttpContextAccessor due to hangfire
            //Register HttpClient
            services.AddScoped<HttpClient>();
            //Register other services
            services.AddMemoryCache();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IDiseaseRepository, DiseaseRepository>();
            services.AddScoped<ISymptomRepository, SymptomRepository>();
            services.AddScoped<IMedicineRepository, MedicineRepository>();
            services.AddCors();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IDiseaseService, DiseaseService>();
            services.AddScoped<ISymptomService, SymptomService>();
            services.AddScoped<IMedicineService, MedicineService>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            return services;
        }
    }
}

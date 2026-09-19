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
            services.AddMemoryCache();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IDiseaseRepository, DiseaseRepository>();
            services.AddScoped<ISymptomRepository, SymptomRepository>();
            services.AddScoped<IMedicineRepository, MedicineRepository>();
            services.AddScoped<IDoctorRepository, DoctorRepository>();
            services.AddCors();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IDiseaseService, DiseaseService>();
            services.AddScoped<ISymptomService, SymptomService>();
            services.AddScoped<IMedicineService, MedicineService>();
            services.AddScoped<IDoctorService, DoctorService>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            return services;
        }
    }
}

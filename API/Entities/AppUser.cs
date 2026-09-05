using Microsoft.AspNetCore.Identity;

namespace API.Entities
{
    public class AppUser : IdentityUser<int> // IdentityUser is a class provided by ASP.NET Core Identity
    {
        public required string FullName { get; set; }
        public DateTime Created { get; set; } = DateTime.UtcNow;
        public ICollection<AppUserRole> UserRoles { get; set; } = [];
    }
}

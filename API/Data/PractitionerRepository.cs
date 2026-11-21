using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class PractitionerRepository(DataContext context) : IPractitionerRepository
    {
        public void AddPractitioner(Practitioner practitioner) => context.Practitioners.Add(practitioner);

        public async Task<Practitioner?> GetPractitionerByAppUserIdAsync(int appUserId) =>
            await context.Practitioners
                .Include(p => p.Country)
                .Include(p => p.AppUser)
                .FirstOrDefaultAsync(p => p.AppUserId == appUserId);
    }
}

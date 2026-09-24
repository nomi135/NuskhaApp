using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class CountryRepository(DataContext context) : ICountryRepository
    {
        public void AddCountry(Country country) => context.Countries.Add(country);

        public void DeleteCountry(Country country) => context.Countries.Remove(country);

        public void UpdateCountry(Country country) => context.Entry(country).State = EntityState.Modified;

        public async Task<Country?> GetCountryByIdAsync(int id) =>
            await context.Countries.FindAsync(id);

        public async Task<IEnumerable<Country>> GetCountriesAsync() =>
            await context.Countries.OrderBy(c => c.Name).ToListAsync();

        public async Task<bool> NameExistsAsync(string name, int? excludeId = null)
        {
            var query = context.Countries.Where(c => c.Name.ToLower() == name.ToLower());
            if (excludeId.HasValue)
                query = query.Where(c => c.Id != excludeId.Value);

            return await query.AnyAsync();
        }
    }
}

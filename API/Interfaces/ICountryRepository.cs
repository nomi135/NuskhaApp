using API.Entities;

namespace API.Interfaces
{
    public interface ICountryRepository
    {
        Task<IEnumerable<Country>> GetCountriesAsync();
        Task<Country?> GetCountryByIdAsync(int id);
        Task<bool> NameExistsAsync(string name, int? excludeId = null);
        void AddCountry(Country country);
        void UpdateCountry(Country country);
        void DeleteCountry(Country country);
    }
}

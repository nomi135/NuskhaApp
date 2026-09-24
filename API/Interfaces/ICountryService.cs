using API.DTOs;

namespace API.Interfaces
{
    public interface ICountryService
    {
        Task<IEnumerable<CountryDto>> GetAllCountriesAsync();
        Task<CountryDto?> GetCountryByIdAsync(int id);
        Task<bool> CheckNameExistsAsync(string name);
        Task<CountryDto> CreateCountryAsync(CountryFormDto dto);
        Task<CountryDto?> UpdateCountryAsync(int id, CountryFormDto dto);
        Task<bool> DeleteCountryAsync(int id);
    }
}

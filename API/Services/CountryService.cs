using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Services;

public class CountryService(IUnitOfWork unitOfWork) : ICountryService
{
    public async Task<IEnumerable<CountryDto>> GetAllCountriesAsync()
    {
        var countries = await unitOfWork.CountryRepository.GetCountriesAsync();
        return countries.Select(MapToDto);
    }

    public async Task<CountryDto?> GetCountryByIdAsync(int id)
    {
        var country = await unitOfWork.CountryRepository.GetCountryByIdAsync(id);
        return country == null ? null : MapToDto(country);
    }

    public Task<bool> CheckNameExistsAsync(string name) =>
        unitOfWork.CountryRepository.NameExistsAsync(name);

    public async Task<CountryDto> CreateCountryAsync(CountryFormDto dto)
    {
        if (await unitOfWork.CountryRepository.NameExistsAsync(dto.Name))
            throw new InvalidOperationException($"A country named '{dto.Name}' already exists.");

        var country = new Country
        {
            Name = dto.Name.Trim()
        };

        unitOfWork.CountryRepository.AddCountry(country);

        if (!await unitOfWork.Complete())
            throw new Exception("Failed to create country");

        return MapToDto(country);
    }

    public async Task<CountryDto?> UpdateCountryAsync(int id, CountryFormDto dto)
    {
        var country = await unitOfWork.CountryRepository.GetCountryByIdAsync(id);
        if (country == null) return null;

        if (await unitOfWork.CountryRepository.NameExistsAsync(dto.Name, id))
            throw new InvalidOperationException($"A country named '{dto.Name}' already exists.");

        country.Name = dto.Name.Trim();

        unitOfWork.CountryRepository.UpdateCountry(country);

        if (!await unitOfWork.Complete())
            throw new Exception("Failed to update country");

        return MapToDto(country);
    }

    public async Task<bool> DeleteCountryAsync(int id)
    {
        var country = await unitOfWork.CountryRepository.GetCountryByIdAsync(id);
        if (country == null) return false;

        unitOfWork.CountryRepository.DeleteCountry(country);

        if (!await unitOfWork.Complete())
            throw new Exception("Failed to delete country");

        return true;
    }

    private static CountryDto MapToDto(Country country) => new()
    {
        Id = country.Id,
        Name = country.Name
    };
}
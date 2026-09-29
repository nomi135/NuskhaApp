using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Services
{
    public class DoctorService(IUnitOfWork unitOfWork, ICacheService cacheService) : IDoctorService
    {
        private const string ListCacheKey = "doctors_all";
        public async Task<IEnumerable<DoctorDto>> GetAllDoctorsAsync(int? countryId = null)
        {
            var allDoctors = await cacheService.GetOrCreateAsync(ListCacheKey, async () =>
            {
                var doctors = await unitOfWork.DoctorRepository.GetDoctorsAsync();
                return doctors.Select(MapToDto).ToList();
            });

            if (!countryId.HasValue) return allDoctors;

            return allDoctors
                .Where(d => d.IsGlobal || d.Countries.Any(c => c.Id == countryId.Value))
                .ToList();
        }

        public async Task<DoctorDto?> GetDoctorByIdAsync(int id)
        {
            var doctor = await unitOfWork.DoctorRepository.GetDoctorByIdAsync(id);
            return doctor == null ? null : MapToDto(doctor);
        }

        public Task<bool> CheckNameExistsAsync(string name) =>
            unitOfWork.DoctorRepository.NameExistsAsync(name);

        public async Task<DoctorDto> CreateDoctorAsync(DoctorFormDto dto)
        {
            if (await unitOfWork.DoctorRepository.NameExistsAsync(dto.Name))
                throw new InvalidOperationException($"A doctor named '{dto.Name}' already exists.");

            var doctor = new Doctor
            {
                Name = dto.Name.Trim(),
                IsGlobal = dto.IsGlobal
            };

            if (!dto.IsGlobal && dto.CountryIds.Count > 0)
            {
                var countries = await unitOfWork.DoctorRepository.GetCountriesByIdsAsync(dto.CountryIds);
                foreach (var country in countries)
                    doctor.Countries.Add(country);
            }

            unitOfWork.DoctorRepository.AddDoctor(doctor);

            if (!await unitOfWork.Complete())
                throw new Exception("Failed to create doctor");

            cacheService.InvalidateAll();

            return MapToDto(doctor);
        }

        public async Task<DoctorDto?> UpdateDoctorAsync(int id, DoctorFormDto dto)
        {
            var doctor = await unitOfWork.DoctorRepository.GetDoctorByIdAsync(id);
            if (doctor == null) return null;

            if (await unitOfWork.DoctorRepository.NameExistsAsync(dto.Name, id))
                throw new InvalidOperationException($"A doctor named '{dto.Name}' already exists.");

            doctor.Name = dto.Name.Trim();
            doctor.IsGlobal = dto.IsGlobal;

            doctor.Countries.Clear();
            if (!dto.IsGlobal && dto.CountryIds.Count > 0)
            {
                var countries = await unitOfWork.DoctorRepository.GetCountriesByIdsAsync(dto.CountryIds);
                foreach (var country in countries)
                    doctor.Countries.Add(country);
            }

            unitOfWork.DoctorRepository.UpdateDoctor(doctor);

            if (!await unitOfWork.Complete())
                throw new Exception("Failed to update doctor");

            cacheService.InvalidateAll();

            return MapToDto(doctor);
        }

        public async Task<bool> DeleteDoctorAsync(int id)
        {
            var doctor = await unitOfWork.DoctorRepository.GetDoctorByIdAsync(id);
            if (doctor == null) return false;

            unitOfWork.DoctorRepository.DeleteDoctor(doctor);

            if (!await unitOfWork.Complete())
                throw new Exception("Failed to delete doctor");

            cacheService.InvalidateAll();

            return true;
        }

        private static DoctorDto MapToDto(Doctor doctor) => new()
        {
            Id = doctor.Id,
            Name = doctor.Name,
            IsGlobal = doctor.IsGlobal,
            Countries = doctor.Countries.Select(c => new CountryLookupDto
            {
                Id = c.Id,
                Name = c.Name
            }).ToList()
        };
    }
}

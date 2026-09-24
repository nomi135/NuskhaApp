using API.Entities;

namespace API.Interfaces
{
    public interface IDoctorRepository
    {
        Task<IEnumerable<Doctor>> GetDoctorsAsync(int? countryId = null);
        Task<Doctor?> GetDoctorByIdAsync(int id);
        Task<bool> NameExistsAsync(string name, int? excludeId = null);
        Task<List<Country>> GetCountriesByIdsAsync(List<int> countryIds);
        void AddDoctor(Doctor doctor);
        void UpdateDoctor(Doctor doctor);
        void DeleteDoctor(Doctor doctor);
    }
}

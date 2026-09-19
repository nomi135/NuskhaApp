using API.Entities;

namespace API.Interfaces
{
    public interface IDoctorRepository
    {
        Task<IEnumerable<Doctor>> GetDoctorsAsync();
        Task<Doctor?> GetDoctorByIdAsync(int id);
        Task<bool> NameExistsAsync(string name, int? excludeId = null);
        void AddDoctor(Doctor doctor);
        void UpdateDoctor(Doctor doctor);
        void DeleteDoctor(Doctor doctor);
    }
}

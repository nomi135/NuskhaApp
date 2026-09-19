using API.DTOs;

namespace API.Interfaces
{
    public interface IDoctorService
    {
        Task<IEnumerable<DoctorDto>> GetAllDoctorsAsync();
        Task<DoctorDto?> GetDoctorByIdAsync(int id);
        Task<bool> CheckNameExistsAsync(string name);
        Task<DoctorDto> CreateDoctorAsync(DoctorFormDto dto);
        Task<DoctorDto?> UpdateDoctorAsync(int id, DoctorFormDto dto);
        Task<bool> DeleteDoctorAsync(int id);
    }
}

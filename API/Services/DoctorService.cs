using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Services
{
    public class DoctorService(IUnitOfWork unitOfWork) : IDoctorService
    {
        public async Task<IEnumerable<DoctorDto>> GetAllDoctorsAsync()
        {
            var doctors = await unitOfWork.DoctorRepository.GetDoctorsAsync();
            return doctors.Select(MapToDto);
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
                Name = dto.Name.Trim()
            };

            unitOfWork.DoctorRepository.AddDoctor(doctor);

            if (!await unitOfWork.Complete())
                throw new Exception("Failed to create doctor");

            return MapToDto(doctor);
        }

        public async Task<DoctorDto?> UpdateDoctorAsync(int id, DoctorFormDto dto)
        {
            var doctor = await unitOfWork.DoctorRepository.GetDoctorByIdAsync(id);
            if (doctor == null) return null;

            if (await unitOfWork.DoctorRepository.NameExistsAsync(dto.Name, id))
                throw new InvalidOperationException($"A doctor named '{dto.Name}' already exists.");

            doctor.Name = dto.Name.Trim();

            unitOfWork.DoctorRepository.UpdateDoctor(doctor);

            if (!await unitOfWork.Complete())
                throw new Exception("Failed to update doctor");

            return MapToDto(doctor);
        }

        public async Task<bool> DeleteDoctorAsync(int id)
        {
            var doctor = await unitOfWork.DoctorRepository.GetDoctorByIdAsync(id);
            if (doctor == null) return false;

            unitOfWork.DoctorRepository.DeleteDoctor(doctor);

            if (!await unitOfWork.Complete())
                throw new Exception("Failed to delete doctor");

            return true;
        }

        private static DoctorDto MapToDto(Doctor doctor) => new()
        {
            Id = doctor.Id,
            Name = doctor.Name
        };
    }
}

using API.DTOs;

namespace API.Interfaces
{
    public interface IMedicineService
    {
        Task<IEnumerable<MedicineDto>> GetAllMedicinesAsync(int? countryId = null);
        Task<MedicineDto?> GetMedicineByIdAsync(int id, int? countryId = null);
        Task<bool> CheckNameExistsAsync(string name);
        Task<MedicineDto> CreateMedicineAsync(MedicineFormDto dto);
        Task<MedicineDto?> UpdateMedicineAsync(int id, MedicineFormDto dto);
        Task<bool> DeleteMedicineAsync(int id);
    }
}

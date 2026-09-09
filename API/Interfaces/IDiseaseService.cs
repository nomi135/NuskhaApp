using API.DTOs;

namespace API.Interfaces
{
    public interface IDiseaseService
    {
        Task<IEnumerable<DiseaseDto>> GetAllDiseasesAsync();
        Task<DiseaseDto?> GetDiseaseByIdAsync(int id);
        Task<bool> CheckNameExistsAsync(string name);
        Task<DiseaseDto> CreateDiseaseAsync(DiseaseFormDto dto);
        Task<DiseaseDto?> UpdateDiseaseAsync(int id, DiseaseFormDto dto);
        Task<bool> DeleteDiseaseAsync(int id);
    }
}

using API.DTOs;

namespace API.Interfaces
{
    public interface ISymptomService
    {
        Task<IEnumerable<SymptomDto>> GetAllSymptomsAsync();
        Task<SymptomDto?> GetSymptomByIdAsync(int id);
        Task<bool> CheckNameExistsAsync(string name);
        Task<SymptomDto> CreateSymptomAsync(SymptomFormDto dto);
        Task<SymptomDto?> UpdateSymptomAsync(int id, SymptomFormDto dto);
        Task<bool> DeleteSymptomAsync(int id);
    }
}

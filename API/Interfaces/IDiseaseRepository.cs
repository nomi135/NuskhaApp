using API.Entities;

namespace API.Interfaces
{
    public interface IDiseaseRepository
    {
        Task<IEnumerable<Disease>> GetDiseasesAsync();
        Task<Disease?> GetDiseaseByIdAsync(int id);
        Task<bool> NameExistsAsync(string name, int? excludeId = null);
        void AddDisease(Disease disease);
        void UpdateDisease(Disease disease);
        void DeleteDisease(Disease disease);
    }
}

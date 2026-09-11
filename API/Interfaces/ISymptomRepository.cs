using API.Entities;

namespace API.Interfaces
{
    public interface ISymptomRepository
    {
        Task<IEnumerable<Symptom>> GetSymptomsAsync();
        Task<Symptom?> GetSymptomByIdAsync(int id);
        Task<bool> NameExistsAsync(string name, int? excludeId = null);
        Task<List<Disease>> GetDiseasesByIdsAsync(List<int> diseaseIds);
        void AddSymptom(Symptom symptom);
        void UpdateSymptom(Symptom symptom);
        void DeleteSymptom(Symptom symptom);
    }
}

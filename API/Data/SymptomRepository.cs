using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class SymptomRepository(DataContext context) : ISymptomRepository
    {
        public void AddSymptom(Symptom symptom) => context.Symptoms.Add(symptom);

        public void DeleteSymptom(Symptom symptom) => context.Symptoms.Remove(symptom);

        public void UpdateSymptom(Symptom symptom) => context.Entry(symptom).State = EntityState.Modified;

        public async Task<Symptom?> GetSymptomByIdAsync(int id) =>
            await context.Symptoms
                .Include(s => s.Diseases)
                .FirstOrDefaultAsync(s => s.Id == id);

        public async Task<IEnumerable<Symptom>> GetSymptomsAsync() =>
            await context.Symptoms
                .Include(s => s.Diseases)
                .OrderBy(s => s.Name)
                .ToListAsync();

        public async Task<bool> NameExistsAsync(string name, int? excludeId = null)
        {
            var query = context.Symptoms.Where(s => s.Name.ToLower() == name.ToLower());
            if (excludeId.HasValue)
                query = query.Where(s => s.Id != excludeId.Value);

            return await query.AnyAsync();
        }

        public async Task<List<Disease>> GetDiseasesByIdsAsync(List<int> diseaseIds) =>
            await context.Diseases.Where(d => diseaseIds.Contains(d.Id)).ToListAsync();

    }
}

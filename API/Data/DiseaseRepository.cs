using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DiseaseRepository(DataContext context) : IDiseaseRepository
{
    public void AddDisease(Disease disease) => context.Diseases.Add(disease);

    public void DeleteDisease(Disease disease) => context.Diseases.Remove(disease);

    public void UpdateDisease(Disease disease) => context.Entry(disease).State = EntityState.Modified;

    public async Task<Disease?> GetDiseaseByIdAsync(int id) =>
        await context.Diseases.FindAsync(id);

    public async Task<IEnumerable<Disease>> GetDiseasesAsync() =>
        await context.Diseases.OrderBy(d => d.Name).ToListAsync();

    public async Task<bool> NameExistsAsync(string name, int? excludeId = null)
    {
        var query = context.Diseases.Where(d => d.Name.ToLower() == name.ToLower());
        if (excludeId.HasValue)
            query = query.Where(d => d.Id != excludeId.Value);

        return await query.AnyAsync();
    }
}
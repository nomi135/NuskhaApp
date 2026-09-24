using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DoctorRepository(DataContext context) : IDoctorRepository
{
    public void AddDoctor(Doctor doctor) => context.Doctors.Add(doctor);

    public void DeleteDoctor(Doctor doctor) => context.Doctors.Remove(doctor);

    public void UpdateDoctor(Doctor doctor) => context.Entry(doctor).State = EntityState.Modified;

    public async Task<Doctor?> GetDoctorByIdAsync(int id) =>
        await context.Doctors
            .Include(d => d.Countries)
            .FirstOrDefaultAsync(d => d.Id == id);

    public async Task<IEnumerable<Doctor>> GetDoctorsAsync(int? countryId = null)
    {
        var query = context.Doctors
            .Include(d => d.Countries)
            .AsQueryable();

        if (countryId.HasValue)
        {
            // Relevant if this doctor is global, or specifically linked to the given country
            query = query.Where(d => d.IsGlobal || d.Countries.Any(c => c.Id == countryId.Value));
        }

        return await query.OrderBy(d => d.Name).ToListAsync();
    }

    public async Task<bool> NameExistsAsync(string name, int? excludeId = null)
    {
        var query = context.Doctors.Where(d => d.Name.ToLower() == name.ToLower());
        if (excludeId.HasValue)
            query = query.Where(d => d.Id != excludeId.Value);

        return await query.AnyAsync();
    }

    public async Task<List<Country>> GetCountriesByIdsAsync(List<int> countryIds) =>
        await context.Countries.Where(c => countryIds.Contains(c.Id)).ToListAsync();
}
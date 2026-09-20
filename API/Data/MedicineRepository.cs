using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class MedicineRepository(DataContext context) : IMedicineRepository
    {
        public void AddMedicine(Medicine medicine) => context.Medicines.Add(medicine);

        public void DeleteMedicine(Medicine medicine) => context.Medicines.Remove(medicine);

        public void UpdateMedicine(Medicine medicine) => context.Entry(medicine).State = EntityState.Modified;

        public async Task<Medicine?> GetMedicineByIdAsync(int id) =>
        await context.Medicines
            .Include(m => m.MedicineDoctors)
                .ThenInclude(md => md.Doctor)
            .Include(m => m.MedicineDoctors)
                .ThenInclude(md => md.Symptoms)
            .FirstOrDefaultAsync(m => m.Id == id);

        public async Task<IEnumerable<Medicine>> GetMedicinesAsync() =>
        await context.Medicines
            .Include(m => m.MedicineDoctors)
                .ThenInclude(md => md.Doctor)
            .Include(m => m.MedicineDoctors)
                .ThenInclude(md => md.Symptoms)
            .OrderBy(m => m.Name)
            .ToListAsync();

        public async Task<bool> NameExistsAsync(string name, int? excludeId = null)
        {
            var query = context.Medicines.Where(m => m.Name.ToLower() == name.ToLower());
            if (excludeId.HasValue)
                query = query.Where(m => m.Id != excludeId.Value);

            return await query.AnyAsync();
        }

        public async Task<List<Doctor>> GetDoctorsByIdsAsync(List<int> doctorIds) =>
            await context.Doctors.Where(d => doctorIds.Contains(d.Id)).ToListAsync();

        public async Task<List<Symptom>> GetSymptomsByIdsAsync(List<int> symptomIds) =>
            await context.Symptoms.Where(s => symptomIds.Contains(s.Id)).ToListAsync();
    }
}

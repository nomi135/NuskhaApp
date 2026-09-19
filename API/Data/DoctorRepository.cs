using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class DoctorRepository(DataContext context) : IDoctorRepository
    {
        public void AddDoctor(Doctor doctor) => context.Doctors.Add(doctor);

        public void DeleteDoctor(Doctor doctor) => context.Doctors.Remove(doctor);

        public void UpdateDoctor(Doctor doctor) => context.Entry(doctor).State = EntityState.Modified;

        public async Task<Doctor?> GetDoctorByIdAsync(int id) =>
            await context.Doctors.FindAsync(id);

        public async Task<IEnumerable<Doctor>> GetDoctorsAsync() =>
            await context.Doctors.OrderBy(d => d.Name).ToListAsync();

        public async Task<bool> NameExistsAsync(string name, int? excludeId = null)
        {
            var query = context.Doctors.Where(d => d.Name.ToLower() == name.ToLower());
            if (excludeId.HasValue)
                query = query.Where(d => d.Id != excludeId.Value);

            return await query.AnyAsync();
        }
    }
}

using API.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace API.Data
{
    public class UnitOfWork(DataContext context, IUserRepository userRepository, IDiseaseRepository diseaseRepository, ISymptomRepository symptomRepository, 
                            IMedicineRepository medicineRepository, IDoctorRepository doctorRepository, ICountryRepository countryRepository,
                            IPractitionerRepository practitionerRepository) : IUnitOfWork
    {
        public IUserRepository UserRepository => userRepository;
        public IDiseaseRepository DiseaseRepository => diseaseRepository;
        public ISymptomRepository SymptomRepository => symptomRepository;
        public IMedicineRepository MedicineRepository => medicineRepository;
        public IDoctorRepository DoctorRepository => doctorRepository;
        public ICountryRepository CountryRepository => countryRepository;
        public IPractitionerRepository PractitionerRepository => practitionerRepository;

        public Task<IDbContextTransaction> BeginTransactionAsync() => context.Database.BeginTransactionAsync();

        public async Task<bool> Complete()
        {
            return await context.SaveChangesAsync() > 0;
        }

        public bool HasChanges()
        {
            return context.ChangeTracker.HasChanges();
        }
    }
}

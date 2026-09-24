using API.Interfaces;

namespace API.Data
{
    public class UnitOfWork(DataContext context, IUserRepository userRepository, IDiseaseRepository diseaseRepository, ISymptomRepository symptomRepository, 
                            IMedicineRepository medicineRepository, IDoctorRepository doctorRepository, ICountryRepository countryRepository) : IUnitOfWork
    {
        public IUserRepository UserRepository => userRepository;
        public IDiseaseRepository DiseaseRepository => diseaseRepository;
        public ISymptomRepository SymptomRepository => symptomRepository;
        public IMedicineRepository MedicineRepository => medicineRepository;
        public IDoctorRepository DoctorRepository => doctorRepository;
        public ICountryRepository CountryRepository => countryRepository;

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

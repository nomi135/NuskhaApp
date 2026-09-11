using API.Interfaces;

namespace API.Data
{
    public class UnitOfWork(DataContext context, IUserRepository userRepository, IDiseaseRepository diseaseRepository, ISymptomRepository symptomRepository) : IUnitOfWork
    {
        public IUserRepository UserRepository => userRepository;
        public IDiseaseRepository DiseaseRepository => diseaseRepository;

        public ISymptomRepository SymptomRepository => symptomRepository;

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

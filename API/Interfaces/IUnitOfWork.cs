using Microsoft.EntityFrameworkCore.Storage;

namespace API.Interfaces
{
    public interface IUnitOfWork
    {
        IUserRepository UserRepository { get; }
        IDiseaseRepository DiseaseRepository { get; }
        ISymptomRepository SymptomRepository { get; }
        IMedicineRepository MedicineRepository { get; }
        IDoctorRepository DoctorRepository { get; }
        ICountryRepository CountryRepository { get; }
        IPractitionerRepository PractitionerRepository { get; }
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<bool> Complete();
        bool HasChanges();
    }
}

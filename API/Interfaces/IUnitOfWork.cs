namespace API.Interfaces
{
    public interface IUnitOfWork
    {
        IUserRepository UserRepository { get; }
        IDiseaseRepository DiseaseRepository { get; }
        ISymptomRepository SymptomRepository { get; }
        IMedicineRepository MedicineRepository { get; }
        Task<bool> Complete();
        bool HasChanges();
    }
}

namespace API.Interfaces
{
    public interface IUnitOfWork
    {
        IUserRepository UserRepository { get; }
        IDiseaseRepository DiseaseRepository { get; }
        Task<bool> Complete();
        bool HasChanges();
    }
}

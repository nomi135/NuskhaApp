using API.Entities;

namespace API.Interfaces
{
    public interface IPractitionerRepository
    {
        Task<Practitioner?> GetPractitionerByAppUserIdAsync(int appUserId);
        void AddPractitioner(Practitioner practitioner);
    }
}

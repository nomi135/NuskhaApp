using API.DTOs;

namespace API.Interfaces
{
    public interface IPractitionerService
    {
        Task<PractitionerAuthDto> SignupAsync(PractitionerSignupDto dto);
        Task<PractitionerAuthDto> LoginAsync(PractitionerLoginDto dto);
    }
}

namespace API.Interfaces
{
    public record GoogleUserInfo(
            string Subject,
            string Email,
            bool EmailVerified,
            string? Name,
            string? PictureUrl);

    public interface IGoogleAuthService
    {

        // Returns null when the token is invalid, expired, or issued for a different app
        Task<GoogleUserInfo?> ValidateIdTokenAsync(string idToken);
    }
}

using API.Interfaces;
using Google.Apis.Auth;

namespace API.Services
{
    public class GoogleAuthService(IConfiguration config, ILogger<GoogleAuthService> logger) : IGoogleAuthService
    {
        public async Task<GoogleUserInfo?> ValidateIdTokenAsync(string idToken)
        {
            var clientId = config["Google:ClientId"];
            if (string.IsNullOrWhiteSpace(clientId))
                throw new InvalidOperationException("Google:ClientId is not configured.");

            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken,
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = [clientId]
                    });

                return new GoogleUserInfo(
                    payload.Subject,
                    payload.Email,
                    payload.EmailVerified,
                    payload.Name,
                    payload.Picture);
            }
            catch (InvalidJwtException ex)
            {
                logger.LogWarning(ex, "Rejected invalid Google ID token");
                return null;
            }
        }
    }
}

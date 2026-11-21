using API.Interfaces;
using System.Text.Json.Serialization;

namespace API.Services
{
    public class RecaptchaService(
    HttpClient httpClient,
    IConfiguration config,
    ILogger<RecaptchaService> logger) : IRecaptchaService
    {
        private const string VerifyUrl = "https://www.google.com/recaptcha/api/siteverify";

        public async Task<bool> VerifyAsync(string token, string expectedAction)
        {
            var secret = config["Recaptcha:SecretKey"];
            if (string.IsNullOrWhiteSpace(secret))
                throw new InvalidOperationException("Recaptcha:SecretKey is not configured.");

            var minScore = config.GetValue<double>("Recaptcha:MinScore", 0.5);

            try
            {
                using var content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["secret"] = secret,
                    ["response"] = token
                });

                using var response = await httpClient.PostAsync(VerifyUrl, content);
                if (!response.IsSuccessStatusCode)
                {
                    logger.LogWarning("reCAPTCHA verify call returned {Status}", response.StatusCode);
                    return false;
                }

                var result = await response.Content.ReadFromJsonAsync<RecaptchaResponse>();
                if (result is null || !result.Success)
                {
                    logger.LogWarning("reCAPTCHA rejected: {Errors}",
                        string.Join(", ", result?.ErrorCodes ?? []));
                    return false;
                }

                // The token must have been generated for this exact action, and look human enough
                if (!string.Equals(result.Action, expectedAction, StringComparison.OrdinalIgnoreCase))
                {
                    logger.LogWarning("reCAPTCHA action mismatch: expected {Expected}, got {Actual}",
                        expectedAction, result.Action);
                    return false;
                }

                return result.Score >= minScore;
            }
            catch (HttpRequestException ex)
            {
                logger.LogError(ex, "Could not reach the reCAPTCHA verification service");
                return false;
            }
        }

        private sealed class RecaptchaResponse
        {
            [JsonPropertyName("success")] public bool Success { get; set; }
            [JsonPropertyName("score")] public double Score { get; set; }
            [JsonPropertyName("action")] public string? Action { get; set; }
            [JsonPropertyName("error-codes")] public List<string>? ErrorCodes { get; set; }
        }
    }
}

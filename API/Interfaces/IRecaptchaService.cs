namespace API.Interfaces
{
    public interface IRecaptchaService
    {
        Task<bool> VerifyAsync(string token, string expectedAction);
    }
}

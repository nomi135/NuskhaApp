namespace API.DTOs
{
    public class PractitionerAuthDto
    {
        public string Token { get; set; } = string.Empty;
        public PractitionerDto Practitioner { get; set; } = null!;
    }
}

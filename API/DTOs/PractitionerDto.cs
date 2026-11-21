namespace API.DTOs
{
    public class PractitionerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string? PictureUrl { get; set; }
        public string? Qualification { get; set; }
        public int CountryId { get; set; }
        public string CountryName { get; set; } = string.Empty;
        public string? City { get; set; }
        public string WhatsAppNumber { get; set; } = string.Empty;
    }
}

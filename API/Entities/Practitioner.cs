namespace API.Entities
{
    public class Practitioner
    {
        public int Id { get; set; }

        public int AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;

        public required string Name { get; set; }
        public Gender Gender { get; set; }
        public string? PicturePath { get; set; }
        public string? Qualification { get; set; }

        public int CountryId { get; set; }
        public Country Country { get; set; } = null!;

        public string? City { get; set; }
        public required string WhatsAppNumber { get; set; }
    }
}

namespace API.DTOs
{
    public class SymptomDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public List<DiseaseLookupDto> Diseases { get; set; } = [];
        public List<MedicineLookupDto> Medicines { get; set; } = [];
    }
}

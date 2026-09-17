namespace API.DTOs
{
    public class MedicineDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Caution { get; set; }
        public List<string> Potencies { get; set; } = [];
        public List<SymptomLookupDto> Symptoms { get; set; } = [];
    }
}

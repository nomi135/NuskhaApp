namespace API.DTOs
{
    public class MedicineDoctorLinkDto
    {
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public List<string> Potencies { get; set; } = [];
        public List<SymptomLookupDto> Symptoms { get; set; } = [];
    }
}

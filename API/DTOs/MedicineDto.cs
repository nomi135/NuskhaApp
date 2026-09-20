namespace API.DTOs
{
    public class MedicineDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Caution { get; set; }
        public List<MedicineDoctorLinkDto> DoctorLinks { get; set; } = [];
    }
}

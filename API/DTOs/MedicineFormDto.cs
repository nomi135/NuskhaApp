using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class MedicineFormDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? Caution { get; set; }

        // One entry per doctor this medicine is linked to, each with its own potencies + symptoms
        public List<MedicineDoctorLinkFormDto> DoctorLinks { get; set; } = [];
    }
}

using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class MedicineDoctorLinkFormDto
    {
        [Required]
        public int DoctorId { get; set; }

        public List<string> Potencies { get; set; } = [];

        public List<int> SymptomIds { get; set; } = [];
    }
}

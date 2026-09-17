using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class MedicineFormDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? Caution { get; set; }

        public List<string> Potencies { get; set; } = [];

        // IDs of symptoms this medicine treats. Optional — a medicine can exist
        // before being linked to any symptom.
        public List<int> SymptomIds { get; set; } = [];
    }
}

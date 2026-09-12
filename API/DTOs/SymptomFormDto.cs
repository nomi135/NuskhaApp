using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class SymptomFormDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public IFormFile? Image { get; set; }

        // IDs of diseases this symptom is associated with. Optional — a symptom
        // can be created before being linked to any disease.
        public List<int> DiseaseIds { get; set; } = [];
    }
}

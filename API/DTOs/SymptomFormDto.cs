using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class SymptomFormDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public IFormFile Image { get; set; } = null!;

        // IDs of diseases this symptom is associated with. Optional — a symptom
        // can be created before being linked to any disease.
        public List<int> DiseaseIds { get; set; } = [];
    }
}

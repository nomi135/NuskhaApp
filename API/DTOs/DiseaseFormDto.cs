using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class DiseaseFormDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public IFormFile Image { get; set; } = null!;
    }
}

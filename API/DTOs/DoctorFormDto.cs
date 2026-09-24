using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class DoctorFormDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public bool IsGlobal { get; set; } = false;

        // Ignored server-side when IsGlobal is true
        public List<int> CountryIds { get; set; } = [];
    }
}

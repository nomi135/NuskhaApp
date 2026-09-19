using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class DoctorFormDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
    }
}

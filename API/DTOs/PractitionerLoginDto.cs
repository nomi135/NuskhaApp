using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class PractitionerLoginDto
    {
        [Required]
        public string GoogleIdToken { get; set; } = string.Empty;
    }
}

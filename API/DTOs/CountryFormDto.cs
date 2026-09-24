using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class CountryFormDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
    }
}

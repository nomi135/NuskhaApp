using API.Entities;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class PractitionerSignupDto
    {
        [Required]
        public string GoogleIdToken { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, EnumDataType(typeof(Gender))]
        public Gender? Gender { get; set; }

        [StringLength(500)]
        public string? Qualification { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Country is required.")]
        public int CountryId { get; set; }

        [StringLength(100)]
        public string? City { get; set; }

        [Required]
        [RegularExpression(@"^\+[1-9]\d{7,14}$",
            ErrorMessage = "WhatsApp number must be in international format, e.g. +923001234567.")]
        public string WhatsAppNumber { get; set; } = string.Empty;

        public IFormFile? Picture { get; set; }

        [Required]
        public string RecaptchaToken { get; set; } = string.Empty;
    }
}

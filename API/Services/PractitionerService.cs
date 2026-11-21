using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace API.Services
{
    public class PractitionerService(
        IUnitOfWork unitOfWork,
        UserManager<AppUser> userManager,
        RoleManager<AppRole> roleManager,
        ITokenService tokenService,
        IGoogleAuthService googleAuthService,
        IRecaptchaService recaptchaService,
        IWebHostEnvironment env,
        ILogger<PractitionerService> logger) : IPractitionerService
    {
        private const string GoogleProvider = "Google";
        private const string RoleName = "Practitioner";
        private const string FolderName = "practitioners";
        private const long MaxPictureBytes = 5 * 1024 * 1024;

        // The file extension comes from this map, never from the uploaded file name
        private static readonly Dictionary<string, string> AllowedImageTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            ["image/jpeg"] = ".jpg",
            ["image/png"] = ".png",
            ["image/webp"] = ".webp"
        };

        public async Task<PractitionerAuthDto> SignupAsync(PractitionerSignupDto dto)
        {
            if (!await recaptchaService.VerifyAsync(dto.RecaptchaToken, "signup"))
                throw new InvalidOperationException("reCAPTCHA verification failed. Please try again.");

            var google = await googleAuthService.ValidateIdTokenAsync(dto.GoogleIdToken)
                ?? throw new UnauthorizedAccessException("Invalid Google sign-in.");

            if (!google.EmailVerified)
                throw new InvalidOperationException("Your Google email address is not verified.");

            var country = await unitOfWork.CountryRepository.GetCountryByIdAsync(dto.CountryId)
                ?? throw new InvalidOperationException("The selected country was not found.");

            if (await userManager.FindByLoginAsync(GoogleProvider, google.Subject) != null
                || await userManager.FindByEmailAsync(google.Email) != null)
                throw new InvalidOperationException("An account already exists for this Google account. Please log in instead.");

            ValidatePicture(dto.Picture);

            string? picturePath = null;
            await using var transaction = await unitOfWork.BeginTransactionAsync();
            try
            {
                var user = new AppUser
                {
                    UserName = google.Email,
                    Email = google.Email,
                    EmailConfirmed = true,
                    FullName = google.Name
                };

                ThrowIfFailed(await userManager.CreateAsync(user));
                ThrowIfFailed(await userManager.AddLoginAsync(user,
                    new UserLoginInfo(GoogleProvider, google.Subject, GoogleProvider)));

                if (!await roleManager.RoleExistsAsync(RoleName))
                    ThrowIfFailed(await roleManager.CreateAsync(new AppRole { Name = RoleName }));
                ThrowIfFailed(await userManager.AddToRoleAsync(user, RoleName));

                picturePath = await SavePictureAsync(dto.Picture);

                var practitioner = new Practitioner
                {
                    AppUser = user,
                    Name = dto.Name.Trim(),
                    Gender = dto.Gender!.Value,
                    PicturePath = picturePath,
                    Qualification = NullIfBlank(dto.Qualification),
                    Country = country,
                    City = NullIfBlank(dto.City),
                    WhatsAppNumber = dto.WhatsAppNumber
                };

                unitOfWork.PractitionerRepository.AddPractitioner(practitioner);

                if (!await unitOfWork.Complete())
                    throw new Exception("Failed to create practitioner");

                await transaction.CommitAsync();

                return new PractitionerAuthDto
                {
                    Token = await tokenService.CreateToken(user),
                    Practitioner = MapToDto(practitioner)
                };
            }
            catch
            {
                // The transaction rolls back on its own; only the saved file needs manual cleanup
                TryDeletePicture(picturePath);
                throw;
            }
        }

        public async Task<PractitionerAuthDto> LoginAsync(PractitionerLoginDto dto)
        {
            var google = await googleAuthService.ValidateIdTokenAsync(dto.GoogleIdToken)
                ?? throw new UnauthorizedAccessException("Invalid Google sign-in.");

            var user = await userManager.FindByLoginAsync(GoogleProvider, google.Subject)
                ?? throw new InvalidOperationException("No account found for this Google account. Please sign up first.");

            var practitioner = await unitOfWork.PractitionerRepository.GetPractitionerByAppUserIdAsync(user.Id)
                ?? throw new InvalidOperationException("This Google account is not registered as a practitioner.");

            return new PractitionerAuthDto
            {
                Token = await tokenService.CreateToken(user),
                Practitioner = MapToDto(practitioner)
            };
        }

        private static void ThrowIfFailed(IdentityResult result)
        {
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join(" ", result.Errors.Select(e => e.Description)));
        }

        private static string? NullIfBlank(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        private static void ValidatePicture(IFormFile? picture)
        {
            if (picture == null || picture.Length == 0) return;

            if (picture.Length > MaxPictureBytes)
                throw new InvalidOperationException("Picture must be 5 MB or smaller.");

            if (!AllowedImageTypes.ContainsKey(picture.ContentType))
                throw new InvalidOperationException("Picture must be a JPEG, PNG or WebP image.");
        }

        private string GetWebRoot() =>
            string.IsNullOrEmpty(env.WebRootPath)
                ? Path.Combine(env.ContentRootPath, "wwwroot")
                : env.WebRootPath;

        private async Task<string?> SavePictureAsync(IFormFile? picture)
        {
            if (picture == null || picture.Length == 0) return null;

            var uploadsFolder = Path.Combine(GetWebRoot(), FolderName);
            Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{AllowedImageTypes[picture.ContentType]}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await picture.CopyToAsync(stream);

            return $"/{FolderName}/{fileName}";
        }

        private void TryDeletePicture(string? picturePath)
        {
            if (string.IsNullOrEmpty(picturePath)) return;

            try
            {
                var fullPath = Path.Combine(GetWebRoot(), picturePath.TrimStart('/'));
                if (File.Exists(fullPath))
                    File.Delete(fullPath);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to delete picture {PicturePath}", picturePath);
            }
        }

        private static PractitionerDto MapToDto(Practitioner practitioner) => new()
        {
            Id = practitioner.Id,
            Name = practitioner.Name,
            Email = practitioner.AppUser.Email ?? string.Empty,
            Gender = practitioner.Gender.ToString(),
            PictureUrl = practitioner.PicturePath,
            Qualification = practitioner.Qualification,
            CountryId = practitioner.CountryId,
            CountryName = practitioner.Country.Name,
            City = practitioner.City,
            WhatsAppNumber = practitioner.WhatsAppNumber
        };
    }
}

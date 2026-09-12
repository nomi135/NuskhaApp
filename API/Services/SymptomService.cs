using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Services
{
    public class SymptomService(IUnitOfWork unitOfWork, IWebHostEnvironment env) : ISymptomService
    {
        private const string FolderName = "symptoms";

        public async Task<IEnumerable<SymptomDto>> GetAllSymptomsAsync()
        {
            var symptoms = await unitOfWork.SymptomRepository.GetSymptomsAsync();
            return symptoms.Select(MapToDto);
        }

        public async Task<SymptomDto?> GetSymptomByIdAsync(int id)
        {
            var symptom = await unitOfWork.SymptomRepository.GetSymptomByIdAsync(id);
            return symptom == null ? null : MapToDto(symptom);
        }

        public Task<bool> CheckNameExistsAsync(string name) =>
            unitOfWork.SymptomRepository.NameExistsAsync(name);

        public async Task<SymptomDto> CreateSymptomAsync(SymptomFormDto dto)
        {
            if (await unitOfWork.SymptomRepository.NameExistsAsync(dto.Name))
                throw new InvalidOperationException($"A symptom named '{dto.Name}' already exists.");

            var imagePath = dto.Image != null ? await SaveImageAsync(dto.Image, dto.Name) : null;

            var symptom = new Symptom
            {
                Name = dto.Name.Trim(),
                ImagePath = imagePath
            };

            if (dto.DiseaseIds.Count > 0)
            {
                var diseases = await unitOfWork.SymptomRepository.GetDiseasesByIdsAsync(dto.DiseaseIds);
                foreach (var disease in diseases)
                    symptom.Diseases.Add(disease);
            }

            unitOfWork.SymptomRepository.AddSymptom(symptom);

            if (!await unitOfWork.Complete())
                throw new Exception("Failed to create symptom");

            return MapToDto(symptom);
        }

        public async Task<SymptomDto?> UpdateSymptomAsync(int id, SymptomFormDto dto)
        {
            var symptom = await unitOfWork.SymptomRepository.GetSymptomByIdAsync(id);
            if (symptom == null) return null;

            if (await unitOfWork.SymptomRepository.NameExistsAsync(dto.Name, id))
                throw new InvalidOperationException($"A symptom named '{dto.Name}' already exists.");

            if(dto.Image != null)
            {
                var oldImagePath = symptom.ImagePath;
                var newImagePath = await SaveImageAsync(dto.Image, dto.Name);
                symptom.ImagePath = newImagePath;
                if (oldImagePath != newImagePath)
                    DeletePhysicalImage(oldImagePath);
            }

            symptom.Name = dto.Name.Trim();

            // Reset and re-link disease associations to match the incoming list exactly
            symptom.Diseases.Clear();
            if (dto.DiseaseIds.Count > 0)
            {
                var diseases = await unitOfWork.SymptomRepository.GetDiseasesByIdsAsync(dto.DiseaseIds);
                foreach (var disease in diseases)
                    symptom.Diseases.Add(disease);
            }

            unitOfWork.SymptomRepository.UpdateSymptom(symptom);

            if (!await unitOfWork.Complete())
                throw new Exception("Failed to update symptom");

            return MapToDto(symptom);
        }

        public async Task<bool> DeleteSymptomAsync(int id)
        {
            var symptom = await unitOfWork.SymptomRepository.GetSymptomByIdAsync(id);
            if (symptom == null) return false;

            unitOfWork.SymptomRepository.DeleteSymptom(symptom);

            if (!await unitOfWork.Complete())
                throw new Exception("Failed to delete symptom");

            DeletePhysicalImage(symptom.ImagePath);

            return true;
        }

        private async Task<string> SaveImageAsync(IFormFile image, string name)
        {
            var webRoot = string.IsNullOrEmpty(env.WebRootPath)
                ? Path.Combine(env.ContentRootPath, "wwwroot")
                : env.WebRootPath;

            var uploadsFolder = Path.Combine(webRoot, FolderName);
            Directory.CreateDirectory(uploadsFolder);

            var extension = Path.GetExtension(image.FileName);
            var fileName = $"{name.ToLower().Replace(" ", "")}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await image.CopyToAsync(stream);

            return $"/{FolderName}/{fileName}";
        }

        private void DeletePhysicalImage(string? imagePath)
        {
            if (string.IsNullOrEmpty(imagePath)) return;

            var webRoot = string.IsNullOrEmpty(env.WebRootPath)
                ? Path.Combine(env.ContentRootPath, "wwwroot")
                : env.WebRootPath;

            var fullPath = Path.Combine(webRoot, imagePath.TrimStart('/'));
            if (File.Exists(fullPath))
                File.Delete(fullPath);
        }

        private static SymptomDto MapToDto(Symptom symptom) => new()
        {
            Id = symptom.Id,
            Name = symptom.Name,
            ImageUrl = symptom.ImagePath,
            Diseases = symptom.Diseases.Select(d => new DiseaseLookupDto
            {
                Id = d.Id,
                Name = d.Name
            }).ToList()
        };
    }
}

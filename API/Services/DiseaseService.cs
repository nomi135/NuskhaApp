using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Services;

public class DiseaseService(IUnitOfWork unitOfWork, IWebHostEnvironment env) : IDiseaseService
{
    private const string FolderName = "diseases";

    public async Task<IEnumerable<DiseaseDto>> GetAllDiseasesAsync()
    {
        var diseases = await unitOfWork.DiseaseRepository.GetDiseasesAsync();
        return diseases.Select(MapToDto);
    }

    public async Task<DiseaseDto?> GetDiseaseByIdAsync(int id)
    {
        var disease = await unitOfWork.DiseaseRepository.GetDiseaseByIdAsync(id);
        return disease == null ? null : MapToDto(disease);
    }

    public Task<bool> CheckNameExistsAsync(string name) =>
        unitOfWork.DiseaseRepository.NameExistsAsync(name);

    public async Task<DiseaseDto> CreateDiseaseAsync(DiseaseFormDto dto)
    {
        if (await unitOfWork.DiseaseRepository.NameExistsAsync(dto.Name))
            throw new InvalidOperationException($"A disease named '{dto.Name}' already exists.");

        var imagePath = await SaveImageAsync(dto.Image, dto.Name);

        var disease = new Disease
        {
            Name = dto.Name.Trim(),
            ImagePath = imagePath
        };

        unitOfWork.DiseaseRepository.AddDisease(disease);

        if (!await unitOfWork.Complete())
            throw new Exception("Failed to create disease");

        return MapToDto(disease);
    }

    public async Task<DiseaseDto?> UpdateDiseaseAsync(int id, DiseaseFormDto dto)
    {
        var disease = await unitOfWork.DiseaseRepository.GetDiseaseByIdAsync(id);
        if (disease == null) return null;

        if (await unitOfWork.DiseaseRepository.NameExistsAsync(dto.Name, id))
            throw new InvalidOperationException($"A disease named '{dto.Name}' already exists.");

        var oldImagePath = disease.ImagePath;
        var newImagePath = await SaveImageAsync(dto.Image, dto.Name);

        disease.Name = dto.Name.Trim();
        disease.ImagePath = newImagePath;

        unitOfWork.DiseaseRepository.UpdateDisease(disease);

        if (!await unitOfWork.Complete())
            throw new Exception("Failed to update disease");

        if (oldImagePath != newImagePath)
            DeletePhysicalImage(oldImagePath);

        return MapToDto(disease);
    }

    public async Task<bool> DeleteDiseaseAsync(int id)
    {
        var disease = await unitOfWork.DiseaseRepository.GetDiseaseByIdAsync(id);
        if (disease == null) return false;

        unitOfWork.DiseaseRepository.DeleteDisease(disease);

        if (!await unitOfWork.Complete())
            throw new Exception("Failed to delete disease");

        DeletePhysicalImage(disease.ImagePath);

        return true;
    }

    private async Task<string> SaveImageAsync(IFormFile image, string name)
    {
        var webRoot = string.IsNullOrEmpty(env.WebRootPath)
        ? Path.Combine(env.ContentRootPath, "wwwroot")
        : env.WebRootPath;

        var uploadsFolder = Path.Combine(webRoot, FolderName);
        Directory.CreateDirectory(uploadsFolder); // creates wwwroot AND diseases if missing

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

        var fullPath = Path.Combine(env.WebRootPath, imagePath.TrimStart('/'));
        if (File.Exists(fullPath))
            File.Delete(fullPath);
    }

    private static DiseaseDto MapToDto(Disease disease) => new()
    {
        Id = disease.Id,
        Name = disease.Name,
        ImageUrl = disease.ImagePath,
        Symptoms = disease.Symptoms.Select(s => new SymptomLookupDto
        {
            Id = s.Id,
            Name = s.Name
        }).ToList()
    };
}
using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Services;

public class MedicineService(IUnitOfWork unitOfWork) : IMedicineService
{
    public async Task<IEnumerable<MedicineDto>> GetAllMedicinesAsync()
    {
        var medicines = await unitOfWork.MedicineRepository.GetMedicinesAsync();
        return medicines.Select(MapToDto);
    }

    public async Task<MedicineDto?> GetMedicineByIdAsync(int id)
    {
        var medicine = await unitOfWork.MedicineRepository.GetMedicineByIdAsync(id);
        return medicine == null ? null : MapToDto(medicine);
    }

    public Task<bool> CheckNameExistsAsync(string name) =>
        unitOfWork.MedicineRepository.NameExistsAsync(name);

    public async Task<MedicineDto> CreateMedicineAsync(MedicineFormDto dto)
    {
        if (await unitOfWork.MedicineRepository.NameExistsAsync(dto.Name))
            throw new InvalidOperationException($"A medicine named '{dto.Name}' already exists.");

        var medicine = new Medicine
        {
            Name = dto.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            Caution = string.IsNullOrWhiteSpace(dto.Caution) ? null : dto.Caution.Trim(),
            Potencies = dto.Potencies
        };

        if (dto.SymptomIds.Count > 0)
        {
            var symptoms = await unitOfWork.MedicineRepository.GetSymptomsByIdsAsync(dto.SymptomIds);
            foreach (var symptom in symptoms)
                medicine.Symptoms.Add(symptom);
        }

        unitOfWork.MedicineRepository.AddMedicine(medicine);

        if (!await unitOfWork.Complete())
            throw new Exception("Failed to create medicine");

        return MapToDto(medicine);
    }

    public async Task<MedicineDto?> UpdateMedicineAsync(int id, MedicineFormDto dto)
    {
        var medicine = await unitOfWork.MedicineRepository.GetMedicineByIdAsync(id);
        if (medicine == null) return null;

        if (await unitOfWork.MedicineRepository.NameExistsAsync(dto.Name, id))
            throw new InvalidOperationException($"A medicine named '{dto.Name}' already exists.");

        medicine.Name = dto.Name.Trim();
        medicine.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        medicine.Caution = string.IsNullOrWhiteSpace(dto.Caution) ? null : dto.Caution.Trim();
        medicine.Potencies = dto.Potencies;

        // Full replace of symptom links, same convention as Symptom <-> Disease updates
        medicine.Symptoms.Clear();
        if (dto.SymptomIds.Count > 0)
        {
            var symptoms = await unitOfWork.MedicineRepository.GetSymptomsByIdsAsync(dto.SymptomIds);
            foreach (var symptom in symptoms)
                medicine.Symptoms.Add(symptom);
        }

        unitOfWork.MedicineRepository.UpdateMedicine(medicine);

        if (!await unitOfWork.Complete())
            throw new Exception("Failed to update medicine");

        return MapToDto(medicine);
    }

    public async Task<bool> DeleteMedicineAsync(int id)
    {
        var medicine = await unitOfWork.MedicineRepository.GetMedicineByIdAsync(id);
        if (medicine == null) return false;

        unitOfWork.MedicineRepository.DeleteMedicine(medicine);

        if (!await unitOfWork.Complete())
            throw new Exception("Failed to delete medicine");

        return true;
    }

    private static MedicineDto MapToDto(Medicine medicine) => new()
    {
        Id = medicine.Id,
        Name = medicine.Name,
        Description = medicine.Description,
        Caution = medicine.Caution,
        Potencies = medicine.Potencies,
        Symptoms = medicine.Symptoms.Select(s => new SymptomLookupDto
        {
            Id = s.Id,
            Name = s.Name
        }).ToList()
    };
}
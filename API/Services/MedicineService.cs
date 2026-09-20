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

        ValidateDoctorLinks(dto.DoctorLinks);

        var medicine = new Medicine
        {
            Name = dto.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            Caution = string.IsNullOrWhiteSpace(dto.Caution) ? null : dto.Caution.Trim()
        };

        await AddDoctorLinksAsync(medicine, dto.DoctorLinks);

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

        ValidateDoctorLinks(dto.DoctorLinks);

        medicine.Name = dto.Name.Trim();
        medicine.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        medicine.Caution = string.IsNullOrWhiteSpace(dto.Caution) ? null : dto.Caution.Trim();

        // Full replace: each doctor link carries its own potencies + symptoms,
        // so on update we drop all existing links and rebuild from what was submitted
        medicine.MedicineDoctors.Clear();
        await AddDoctorLinksAsync(medicine, dto.DoctorLinks);

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

    private static void ValidateDoctorLinks(List<MedicineDoctorLinkFormDto> links)
    {
        var duplicateDoctorIds = links
            .GroupBy(l => l.DoctorId)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicateDoctorIds.Count > 0)
            throw new InvalidOperationException("Each doctor can only be linked once per medicine.");
    }

    private async Task AddDoctorLinksAsync(Medicine medicine, List<MedicineDoctorLinkFormDto> links)
    {
        if (links.Count == 0) return;

        var doctorIds = links.Select(l => l.DoctorId).Distinct().ToList();
        var doctors = await unitOfWork.MedicineRepository.GetDoctorsByIdsAsync(doctorIds);
        var doctorsById = doctors.ToDictionary(d => d.Id);

        foreach (var link in links)
        {
            if (!doctorsById.TryGetValue(link.DoctorId, out var doctor))
                throw new InvalidOperationException($"Doctor with id {link.DoctorId} was not found.");

            var medicineDoctor = new MedicineDoctor
            {
                Doctor = doctor,
                Potencies = link.Potencies
            };

            if (link.SymptomIds.Count > 0)
            {
                var symptoms = await unitOfWork.MedicineRepository.GetSymptomsByIdsAsync(link.SymptomIds);
                foreach (var symptom in symptoms)
                    medicineDoctor.Symptoms.Add(symptom);
            }

            medicine.MedicineDoctors.Add(medicineDoctor);
        }
    }

    private static MedicineDto MapToDto(Medicine medicine) => new()
    {
        Id = medicine.Id,
        Name = medicine.Name,
        Description = medicine.Description,
        Caution = medicine.Caution,
        DoctorLinks = medicine.MedicineDoctors.Select(md => new MedicineDoctorLinkDto
        {
            DoctorId = md.DoctorId,
            DoctorName = md.Doctor.Name,
            Potencies = md.Potencies,
            Symptoms = md.Symptoms.Select(s => new SymptomLookupDto
            {
                Id = s.Id,
                Name = s.Name
            }).ToList()
        }).ToList()
    };
}
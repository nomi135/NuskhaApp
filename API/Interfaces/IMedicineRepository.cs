using API.Entities;

namespace API.Interfaces
{
    public interface IMedicineRepository
    {
        Task<IEnumerable<Medicine>> GetMedicinesAsync();
        Task<Medicine?> GetMedicineByIdAsync(int id);
        Task<bool> NameExistsAsync(string name, int? excludeId = null);
        Task<List<Symptom>> GetSymptomsByIdsAsync(List<int> symptomIds);
        void AddMedicine(Medicine medicine);
        void UpdateMedicine(Medicine medicine);
        void DeleteMedicine(Medicine medicine);
    }
}

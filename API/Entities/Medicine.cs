namespace API.Entities;

public class Medicine
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? Caution { get; set; }

    // Per-doctor potency + symptom linking
    public ICollection<MedicineDoctor> MedicineDoctors { get; set; } = [];
}
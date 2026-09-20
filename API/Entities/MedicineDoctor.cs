namespace API.Entities;

public class MedicineDoctor
{
    public int Id { get; set; }

    public int MedicineId { get; set; }
    public Medicine Medicine { get; set; } = null!;

    public int DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;

    // Potencies specific to this doctor's use of this medicine
    public List<string> Potencies { get; set; } = [];

    // Symptoms this doctor treats with this medicine
    public ICollection<Symptom> Symptoms { get; set; } = [];
}
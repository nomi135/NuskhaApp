namespace API.Entities
{
    public class Symptom
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? ImagePath { get; set; }

        // Many-to-many: a symptom can belong to many diseases
        public ICollection<Disease> Diseases { get; set; } = [];

        // A symptom is now linked to medicines through a specific doctor's entry,
        // not directly to Medicine
        public ICollection<MedicineDoctor> MedicineDoctors { get; set; } = [];
    }
}

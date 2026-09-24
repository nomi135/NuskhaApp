namespace API.Entities
{
    public class Doctor
    {
        public int Id { get; set; }
        public required string Name { get; set; }

        // If true, this doctor is relevant everywhere and Countries is ignored
        public bool IsGlobal { get; set; } = false;

        // Specific countries this doctor is relevant to (only used when IsGlobal is false)
        public ICollection<Country> Countries { get; set; } = [];

        public ICollection<MedicineDoctor> MedicineDoctors { get; set; } = [];
    }
}

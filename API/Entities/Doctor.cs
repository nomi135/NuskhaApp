namespace API.Entities
{
    public class Doctor
    {
        public int Id { get; set; }
        public required string Name { get; set; }

        public ICollection<MedicineDoctor> MedicineDoctors { get; set; } = [];
    }
}

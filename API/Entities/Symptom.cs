namespace API.Entities
{
    public class Symptom
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string ImagePath { get; set; }

        // Many-to-many: a symptom can belong to many diseases
        public ICollection<Disease> Diseases { get; set; } = [];
    }
}

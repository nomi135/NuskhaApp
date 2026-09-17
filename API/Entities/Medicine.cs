namespace API.Entities
{
    public class Medicine
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? Caution { get; set; }

        // Multiple potency values, e.g. ["Q", "30", "200", "1M"]
        public List<string> Potencies { get; set; } = [];

        // Many-to-many: a medicine can be linked to multiple symptoms
        public ICollection<Symptom> Symptoms { get; set; } = [];
    }
}

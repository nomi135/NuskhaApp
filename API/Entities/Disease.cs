namespace API.Entities
{
    public class Disease
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string ImagePath { get; set; }
    }
}

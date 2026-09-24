namespace API.DTOs;

public class DoctorDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsGlobal { get; set; }
    public List<CountryLookupDto> Countries { get; set; } = [];
}
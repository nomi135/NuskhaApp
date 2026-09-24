using API.DTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class CountryController(ICountryService countryService) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CountryDto>>> GetCountries()
        {
            return Ok(await countryService.GetAllCountriesAsync());
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CountryDto>> GetCountry(int id)
        {
            var country = await countryService.GetCountryByIdAsync(id);
            return country == null ? NotFound() : Ok(country);
        }

        [HttpGet("check-name")]
        public async Task<ActionResult<bool>> CheckName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return BadRequest("Name is required");
            return Ok(await countryService.CheckNameExistsAsync(name));
        }

        [HttpPost]
        public async Task<ActionResult<CountryDto>> CreateCountry([FromBody] CountryFormDto dto)
        {
            try
            {
                var created = await countryService.CreateCountryAsync(dto);
                return CreatedAtAction(nameof(GetCountry), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<CountryDto>> UpdateCountry(int id, [FromBody] CountryFormDto dto)
        {
            try
            {
                var updated = await countryService.UpdateCountryAsync(id, dto);
                return updated == null ? NotFound() : Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteCountry(int id)
        {
            var deleted = await countryService.DeleteCountryAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}

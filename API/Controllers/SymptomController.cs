using API.DTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class SymptomController(ISymptomService symptomService) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SymptomDto>>> GetSymptoms()
        {
            return Ok(await symptomService.GetAllSymptomsAsync());
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<SymptomDto>> GetSymptom(int id)
        {
            var symptom = await symptomService.GetSymptomByIdAsync(id);
            return symptom == null ? NotFound() : Ok(symptom);
        }

        [HttpGet("check-name")]
        public async Task<ActionResult<bool>> CheckName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return BadRequest("Name is required");
            return Ok(await symptomService.CheckNameExistsAsync(name));
        }

        [HttpPost]
        public async Task<ActionResult<SymptomDto>> CreateSymptom([FromForm] SymptomFormDto dto)
        {
            try
            {
                var created = await symptomService.CreateSymptomAsync(dto);
                return CreatedAtAction(nameof(GetSymptom), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<SymptomDto>> UpdateSymptom(int id, [FromForm] SymptomFormDto dto)
        {
            try
            {
                var updated = await symptomService.UpdateSymptomAsync(id, dto);
                return updated == null ? NotFound() : Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteSymptom(int id)
        {
            var deleted = await symptomService.DeleteSymptomAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}

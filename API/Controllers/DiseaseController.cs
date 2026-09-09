using API.DTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class DiseaseController(IDiseaseService diseaseService) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DiseaseDto>>> GetDiseases()
        {
            return Ok(await diseaseService.GetAllDiseasesAsync());
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<DiseaseDto>> GetDisease(int id)
        {
            var disease = await diseaseService.GetDiseaseByIdAsync(id);
            return disease == null ? NotFound() : Ok(disease);
        }

        [HttpGet("check-name")]
        public async Task<ActionResult<bool>> CheckName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return BadRequest("Name is required");
            return Ok(await diseaseService.CheckNameExistsAsync(name));
        }

        [HttpPost]
        public async Task<ActionResult<DiseaseDto>> CreateDisease([FromForm] DiseaseFormDto dto)
        {
            try
            {
                var created = await diseaseService.CreateDiseaseAsync(dto);
                return CreatedAtAction(nameof(GetDisease), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<DiseaseDto>> UpdateDisease(int id, [FromForm] DiseaseFormDto dto)
        {
            try
            {
                var updated = await diseaseService.UpdateDiseaseAsync(id, dto);
                return updated == null ? NotFound() : Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteDisease(int id)
        {
            var deleted = await diseaseService.DeleteDiseaseAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}

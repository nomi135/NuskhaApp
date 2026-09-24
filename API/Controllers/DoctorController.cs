using API.DTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class DoctorController(IDoctorService doctorService) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DoctorDto>>> GetDoctors([FromQuery] int? countryId)
        {
            return Ok(await doctorService.GetAllDoctorsAsync(countryId));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<DoctorDto>> GetDoctor(int id)
        {
            var doctor = await doctorService.GetDoctorByIdAsync(id);
            return doctor == null ? NotFound() : Ok(doctor);
        }

        [HttpGet("check-name")]
        public async Task<ActionResult<bool>> CheckName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return BadRequest("Name is required");
            return Ok(await doctorService.CheckNameExistsAsync(name));
        }

        [HttpPost]
        public async Task<ActionResult<DoctorDto>> CreateDoctor([FromBody] DoctorFormDto dto)
        {
            try
            {
                var created = await doctorService.CreateDoctorAsync(dto);
                return CreatedAtAction(nameof(GetDoctor), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<DoctorDto>> UpdateDoctor(int id, [FromBody] DoctorFormDto dto)
        {
            try
            {
                var updated = await doctorService.UpdateDoctorAsync(id, dto);
                return updated == null ? NotFound() : Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var deleted = await doctorService.DeleteDoctorAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}

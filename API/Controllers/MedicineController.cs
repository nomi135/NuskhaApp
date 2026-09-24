using API.DTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class MedicineController(IMedicineService medicineService) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> GetMedicines([FromQuery] int? countryId)
        {
            return Ok(await medicineService.GetAllMedicinesAsync(countryId));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<MedicineDto>> GetMedicine(int id, [FromQuery] int? countryId)
        {
            var medicine = await medicineService.GetMedicineByIdAsync(id, countryId);
            return medicine == null ? NotFound() : Ok(medicine);
        }

        [HttpGet("check-name")]
        public async Task<ActionResult<bool>> CheckName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return BadRequest("Name is required");
            return Ok(await medicineService.CheckNameExistsAsync(name));
        }

        [HttpPost]
        public async Task<ActionResult<MedicineDto>> CreateMedicine([FromBody] MedicineFormDto dto)
        {
            try
            {
                var created = await medicineService.CreateMedicineAsync(dto);
                return CreatedAtAction(nameof(GetMedicine), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<MedicineDto>> UpdateMedicine(int id, [FromBody] MedicineFormDto dto)
        {
            try
            {
                var updated = await medicineService.UpdateMedicineAsync(id, dto);
                return updated == null ? NotFound() : Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteMedicine(int id)
        {
            var deleted = await medicineService.DeleteMedicineAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}

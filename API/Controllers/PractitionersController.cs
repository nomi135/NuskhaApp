using API.DTOs;
using API.Interfaces;
using API.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class PractitionersController(IPractitionerService practitionerService) : BaseApiController
    {
        // multipart/form-data because of the optional picture
        [HttpPost("signup")]
        public async Task<ActionResult<PractitionerAuthDto>> Signup([FromForm] PractitionerSignupDto dto)
        {
            try
            {
                return Ok(await practitionerService.SignupAsync(dto));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<PractitionerAuthDto>> Login([FromBody] PractitionerLoginDto dto)
        {
            try
            {
                return Ok(await practitionerService.LoginAsync(dto));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
}

using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController(UserManager<AppUser> userManager, ITokenService tokenService) : BaseApiController
    {

        [HttpPost("login")] //account/login
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await userManager.Users
                 .Include(x => x.UserRoles)
                 .ThenInclude(x => x.Role)
                 .FirstOrDefaultAsync(x => x.NormalizedUserName == loginDto.Username.ToUpper());

            if (user == null || user.UserName == null) return Unauthorized("Invalid username");

            var isPasswordValid = await userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!isPasswordValid) return Unauthorized("Invalid password");

            return new UserDto
            {
                UserName = user.UserName,
                Roles = [.. user.UserRoles.Select(x => x.Role.Name)],
                Token = await tokenService.CreateToken(user)
            };
        }

    }
}

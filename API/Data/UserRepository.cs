using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class UserRepository(DataContext context) : IUserRepository
    {
        public async Task<AppUser?> GetUserByUsernameAsync(string username)
        {
            return await context.Users
                .SingleOrDefaultAsync(x => x.UserName == username);
        }

    }
}

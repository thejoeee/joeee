using BookStore.API.Models;

namespace BookStore.API.Services
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}
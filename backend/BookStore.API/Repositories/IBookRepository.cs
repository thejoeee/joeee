using BookStore.API.Models;
using BookStore.API.DTOs;

namespace BookStore.API.Repositories
{
    public interface IBookRepository
    {
        Task<IEnumerable<Book>> GetAllAsync(BookFiltersDto? filters = null);
        Task<IEnumerable<Book>> GetByUserIdAsync(Guid userId, BookFiltersDto? filters = null);
        Task<Book?> GetByIdAsync(Guid id);
        Task<Book> CreateAsync(Book book);
        Task<Book> UpdateAsync(Book book);
        Task<bool> DeleteAsync(Guid id, Guid userId);
        Task<IEnumerable<string>> GetCategoriesAsync();
        Task<bool> ExistsAsync(Guid id, Guid userId);
    }
}
using Microsoft.EntityFrameworkCore;
using BookStore.API.Data;
using BookStore.API.Models;
using BookStore.API.DTOs;

namespace BookStore.API.Repositories
{
    public class BookRepository : IBookRepository
    {
        private readonly BookStoreContext _context;

        public BookRepository(BookStoreContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Book>> GetAllAsync(BookFiltersDto? filters = null)
        {
            var query = _context.Books
                .Include(b => b.User)
                .AsQueryable();

            if (filters != null)
            {
                if (!string.IsNullOrEmpty(filters.Search))
                {
                    var searchLower = filters.Search.ToLower();
                    query = query.Where(b => 
                        b.Name.ToLower().Contains(searchLower) || 
                        b.Description.ToLower().Contains(searchLower));
                }

                if (!string.IsNullOrEmpty(filters.Category))
                {
                    query = query.Where(b => b.Category == filters.Category);
                }

                if (filters.MinPrice.HasValue)
                {
                    query = query.Where(b => b.Price >= filters.MinPrice.Value);
                }

                if (filters.MaxPrice.HasValue)
                {
                    query = query.Where(b => b.Price <= filters.MaxPrice.Value);
                }
            }

            return await query
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Book>> GetByUserIdAsync(Guid userId, BookFiltersDto? filters = null)
        {
            var query = _context.Books
                .Include(b => b.User)
                .Where(b => b.UserId == userId);

            if (filters != null)
            {
                if (!string.IsNullOrEmpty(filters.Search))
                {
                    var searchLower = filters.Search.ToLower();
                    query = query.Where(b => 
                        b.Name.ToLower().Contains(searchLower) || 
                        b.Description.ToLower().Contains(searchLower));
                }

                if (!string.IsNullOrEmpty(filters.Category))
                {
                    query = query.Where(b => b.Category == filters.Category);
                }

                if (filters.MinPrice.HasValue)
                {
                    query = query.Where(b => b.Price >= filters.MinPrice.Value);
                }

                if (filters.MaxPrice.HasValue)
                {
                    query = query.Where(b => b.Price <= filters.MaxPrice.Value);
                }
            }

            return await query
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<Book?> GetByIdAsync(Guid id)
        {
            return await _context.Books
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<Book> CreateAsync(Book book)
        {
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(book.Id) ?? book;
        }

        public async Task<Book> UpdateAsync(Book book)
        {
            _context.Books.Update(book);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(book.Id) ?? book;
        }

        public async Task<bool> DeleteAsync(Guid id, Guid userId)
        {
            var book = await _context.Books
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (book == null)
                return false;

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<string>> GetCategoriesAsync()
        {
            return await _context.Books
                .Select(b => b.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(Guid id, Guid userId)
        {
            return await _context.Books
                .AnyAsync(b => b.Id == id && b.UserId == userId);
        }
    }
}
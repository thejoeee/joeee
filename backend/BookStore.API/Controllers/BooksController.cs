using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BookStore.API.DTOs;
using BookStore.API.Models;
using BookStore.API.Repositories;

namespace BookStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly IBookRepository _bookRepository;

        public BooksController(IBookRepository bookRepository)
        {
            _bookRepository = bookRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetAllBooks([FromQuery] BookFiltersDto filters)
        {
            try
            {
                var books = await _bookRepository.GetAllAsync(filters);
                var bookDtos = books.Select(MapToDto).ToList();
                return Ok(bookDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching books", error = ex.Message });
            }
        }

        [HttpGet("my-books")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetMyBooks([FromQuery] BookFiltersDto filters)
        {
            try
            {
                var userId = GetCurrentUserId();
                var books = await _bookRepository.GetByUserIdAsync(userId, filters);
                var bookDtos = books.Select(MapToDto).ToList();
                return Ok(bookDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching your books", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookDto>> GetBook(Guid id)
        {
            try
            {
                var book = await _bookRepository.GetByIdAsync(id);
                if (book == null)
                {
                    return NotFound(new { message = "Book not found" });
                }

                return Ok(MapToDto(book));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the book", error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<BookDto>> CreateBook(CreateBookDto createBookDto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var book = new Book
                {
                    Name = createBookDto.Name,
                    Category = createBookDto.Category,
                    Price = createBookDto.Price,
                    Description = createBookDto.Description,
                    UserId = userId,
                    ImageUrl = createBookDto.ImageUrl,
                    FileUrl = createBookDto.FileUrl,
                    FileName = createBookDto.FileName,
                    FileSize = createBookDto.FileSize
                };

                var createdBook = await _bookRepository.CreateAsync(book);
                return CreatedAtAction(nameof(GetBook), new { id = createdBook.Id }, MapToDto(createdBook));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the book", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<BookDto>> UpdateBook(Guid id, UpdateBookDto updateBookDto)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Check if book exists and belongs to current user
                if (!await _bookRepository.ExistsAsync(id, userId))
                {
                    return NotFound(new { message = "Book not found or you don't have permission to update it" });
                }

                var existingBook = await _bookRepository.GetByIdAsync(id);
                if (existingBook == null)
                {
                    return NotFound(new { message = "Book not found" });
                }

                // Update book properties
                existingBook.Name = updateBookDto.Name;
                existingBook.Category = updateBookDto.Category;
                existingBook.Price = updateBookDto.Price;
                existingBook.Description = updateBookDto.Description;
                existingBook.ImageUrl = updateBookDto.ImageUrl;
                existingBook.FileUrl = updateBookDto.FileUrl;
                existingBook.FileName = updateBookDto.FileName;
                existingBook.FileSize = updateBookDto.FileSize;

                var updatedBook = await _bookRepository.UpdateAsync(existingBook);
                return Ok(MapToDto(updatedBook));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the book", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteBook(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var deleted = await _bookRepository.DeleteAsync(id, userId);

                if (!deleted)
                {
                    return NotFound(new { message = "Book not found or you don't have permission to delete it" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the book", error = ex.Message });
            }
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            try
            {
                var categories = await _bookRepository.GetCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching categories", error = ex.Message });
            }
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid user ID in token");
            }
            return userId;
        }

        private static BookDto MapToDto(Book book)
        {
            return new BookDto
            {
                Id = book.Id,
                Name = book.Name,
                Category = book.Category,
                Price = book.Price,
                Description = book.Description,
                UserId = book.UserId,
                CreatedAt = book.CreatedAt,
                UpdatedAt = book.UpdatedAt,
                ImageUrl = book.ImageUrl,
                FileUrl = book.FileUrl,
                FileName = book.FileName,
                FileSize = book.FileSize,
                User = book.User != null ? new UserDto
                {
                    Id = book.User.Id,
                    Email = book.User.Email,
                    FullName = book.User.FullName,
                    CreatedAt = book.User.CreatedAt
                } : null
            };
        }
    }
}
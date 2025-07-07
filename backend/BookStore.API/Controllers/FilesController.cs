using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace BookStore.API.Controllers
{
    /// <summary>
    /// Controller responsible for handling file uploads for book images and book files.
    /// This controller provides secure file upload functionality with validation and storage management.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All file upload operations require authentication
    public class FilesController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<FilesController> _logger;
        
        // Define allowed file extensions for security
        private readonly string[] _allowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private readonly string[] _allowedBookExtensions = { ".pdf", ".epub", ".docx", ".doc", ".txt", ".mobi", ".azw3" };
        
        // Define maximum file sizes (in bytes)
        private const long MaxImageSize = 5 * 1024 * 1024; // 5MB for images
        private const long MaxBookSize = 100 * 1024 * 1024; // 100MB for book files

        public FilesController(IWebHostEnvironment environment, ILogger<FilesController> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        /// <summary>
        /// Uploads a book cover image file.
        /// This endpoint accepts image files and stores them in the wwwroot/uploads/images directory.
        /// </summary>
        /// <param name="file">The image file to upload</param>
        /// <param name="bookId">Optional book ID for organizing files</param>
        /// <returns>The URL of the uploaded image</returns>
        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file, [FromForm] string? bookId = null)
        {
            try
            {
                // Validate that a file was provided
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file provided" });
                }

                // Validate file size
                if (file.Length > MaxImageSize)
                {
                    return BadRequest(new { message = $"File size exceeds maximum allowed size of {MaxImageSize / (1024 * 1024)}MB" });
                }

                // Validate file extension
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!_allowedImageExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { message = "Invalid file type. Only image files are allowed." });
                }

                // Get current user ID from JWT token
                var userId = GetCurrentUserId();
                
                // Create unique filename to prevent conflicts
                var fileName = $"{bookId ?? Guid.NewGuid().ToString()}-{DateTime.UtcNow:yyyyMMddHHmmss}{fileExtension}";
                
                // Create upload directory if it doesn't exist
                var uploadsDir = Path.Combine(_environment.WebRootPath, "uploads", "images");
                Directory.CreateDirectory(uploadsDir);
                
                // Full path for the file
                var filePath = Path.Combine(uploadsDir, fileName);
                
                // Save the file to disk
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Generate the public URL for the uploaded file
                var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/images/{fileName}";
                
                _logger.LogInformation("Image uploaded successfully: {FileName} by user {UserId}", fileName, userId);

                return Ok(new { 
                    url = fileUrl,
                    fileName = file.FileName,
                    size = file.Length
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image");
                return StatusCode(500, new { message = "An error occurred while uploading the image" });
            }
        }

        /// <summary>
        /// Uploads a book file (PDF, EPUB, etc.).
        /// This endpoint accepts various book file formats and stores them securely.
        /// </summary>
        /// <param name="file">The book file to upload</param>
        /// <param name="bookId">Optional book ID for organizing files</param>
        /// <returns>The URL and metadata of the uploaded book file</returns>
        [HttpPost("upload-book")]
        public async Task<IActionResult> UploadBookFile(IFormFile file, [FromForm] string? bookId = null)
        {
            try
            {
                // Validate that a file was provided
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file provided" });
                }

                // Validate file size
                if (file.Length > MaxBookSize)
                {
                    return BadRequest(new { message = $"File size exceeds maximum allowed size of {MaxBookSize / (1024 * 1024)}MB" });
                }

                // Validate file extension
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!_allowedBookExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { message = "Invalid file type. Only book files (PDF, EPUB, DOCX, etc.) are allowed." });
                }

                // Get current user ID from JWT token
                var userId = GetCurrentUserId();
                
                // Create unique filename to prevent conflicts
                var fileName = $"{bookId ?? Guid.NewGuid().ToString()}-{DateTime.UtcNow:yyyyMMddHHmmss}{fileExtension}";
                
                // Create upload directory if it doesn't exist
                var uploadsDir = Path.Combine(_environment.WebRootPath, "uploads", "books");
                Directory.CreateDirectory(uploadsDir);
                
                // Full path for the file
                var filePath = Path.Combine(uploadsDir, fileName);
                
                // Save the file to disk
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Generate the public URL for the uploaded file
                var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/books/{fileName}";
                
                _logger.LogInformation("Book file uploaded successfully: {FileName} by user {UserId}", fileName, userId);

                return Ok(new { 
                    url = fileUrl,
                    fileName = file.FileName,
                    size = file.Length
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading book file");
                return StatusCode(500, new { message = "An error occurred while uploading the book file" });
            }
        }

        /// <summary>
        /// Deletes an uploaded file from the server.
        /// This endpoint allows users to clean up files that are no longer needed.
        /// </summary>
        /// <param name="fileName">The name of the file to delete</param>
        /// <param name="fileType">The type of file (image or book)</param>
        /// <returns>Success or error response</returns>
        [HttpDelete("delete/{fileType}/{fileName}")]
        public IActionResult DeleteFile(string fileName, string fileType)
        {
            try
            {
                // Validate file type parameter
                if (fileType != "images" && fileType != "books")
                {
                    return BadRequest(new { message = "Invalid file type. Must be 'images' or 'books'" });
                }

                // Construct file path
                var filePath = Path.Combine(_environment.WebRootPath, "uploads", fileType, fileName);
                
                // Check if file exists
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "File not found" });
                }

                // Delete the file
                System.IO.File.Delete(filePath);
                
                _logger.LogInformation("File deleted successfully: {FileName}", fileName);

                return Ok(new { message = "File deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file: {FileName}", fileName);
                return StatusCode(500, new { message = "An error occurred while deleting the file" });
            }
        }

        /// <summary>
        /// Helper method to extract the current user ID from the JWT token.
        /// This method reads the NameIdentifier claim from the authenticated user's token.
        /// </summary>
        /// <returns>The current user's GUID</returns>
        /// <exception cref="UnauthorizedAccessException">Thrown when the user ID cannot be extracted</exception>
        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid user ID in token");
            }
            return userId;
        }
    }
}
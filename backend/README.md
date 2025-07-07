# BookStore .NET Core API

A complete .NET Core Web API backend for the BookStore application with JWT authentication and CRUD operations.

## Features

### 🔐 Authentication & Authorization
- **JWT Token Authentication**: Secure token-based authentication
- **User Registration**: Create new user accounts with email and password
- **User Login**: Authenticate existing users
- **Password Hashing**: Secure password storage using BCrypt
- **Protected Endpoints**: Role-based access control for book management

### 📚 Book Management
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **User-Specific Books**: Users can only manage their own books
- **Public Book Listing**: Anyone can view all books in the store
- **Advanced Filtering**: Search by name, description, category, and price range
- **Category Management**: Dynamic category listing from existing books

### 🗄️ Database
- **PostgreSQL Integration**: Using Entity Framework Core with Npgsql
- **Code-First Approach**: Database schema defined through C# models
- **Automatic Migrations**: Database schema updates through EF migrations
- **Optimized Queries**: Indexed columns for better performance

## Project Structure

```
BookStore.API/
├── Controllers/
│   ├── AuthController.cs      # Authentication endpoints
│   └── BooksController.cs     # Book CRUD endpoints
├── Data/
│   └── BookStoreContext.cs    # Entity Framework DbContext
├── DTOs/
│   ├── AuthDTOs.cs           # Authentication data transfer objects
│   └── BookDTOs.cs           # Book data transfer objects
├── Models/
│   ├── User.cs               # User entity model
│   └── Book.cs               # Book entity model
├── Repositories/
│   ├── IUserRepository.cs    # User repository interface
│   ├── UserRepository.cs     # User repository implementation
│   ├── IBookRepository.cs    # Book repository interface
│   └── BookRepository.cs     # Book repository implementation
├── Services/
│   ├── ITokenService.cs      # JWT token service interface
│   └── TokenService.cs       # JWT token service implementation
├── Program.cs                # Application startup and configuration
├── appsettings.json          # Production configuration
└── appsettings.Development.json # Development configuration
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "guid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/auth/login
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "guid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Book Endpoints

#### GET /api/books
Get all books (public endpoint).

**Query Parameters:**
- `search` (optional): Search in book name and description
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Response:**
```json
[
  {
    "id": "guid",
    "name": "Book Title",
    "category": "Fiction",
    "price": 19.99,
    "description": "Book description",
    "userId": "guid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "imageUrl": "https://example.com/image.jpg",
    "fileUrl": "https://example.com/book.pdf",
    "fileName": "book.pdf",
    "fileSize": 1024000,
    "user": {
      "id": "guid",
      "email": "author@example.com",
      "fullName": "Author Name",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
]
```

#### GET /api/books/my-books
Get books belonging to the authenticated user (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

#### GET /api/books/{id}
Get a specific book by ID.

#### POST /api/books
Create a new book (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "Book Title",
  "category": "Fiction",
  "price": 19.99,
  "description": "Book description",
  "imageUrl": "https://example.com/image.jpg",
  "fileUrl": "https://example.com/book.pdf",
  "fileName": "book.pdf",
  "fileSize": 1024000
}
```

#### PUT /api/books/{id}
Update an existing book (requires authentication and ownership).

#### DELETE /api/books/{id}
Delete a book (requires authentication and ownership).

#### GET /api/books/categories
Get all available book categories.

## Setup Instructions

### Prerequisites
- .NET 8.0 SDK
- PostgreSQL database
- Visual Studio Code or Visual Studio

### 1. Database Setup

Create a PostgreSQL database and update the connection string in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=bookstore;Username=your_username;Password=your_password"
  }
}
```

### 2. JWT Configuration

Update the JWT settings in `appsettings.json`:

```json
{
  "JwtSettings": {
    "SecretKey": "your-super-secret-jwt-key-that-should-be-at-least-32-characters-long",
    "Issuer": "BookStore.API",
    "Audience": "BookStore.Client",
    "ExpirationInDays": 7
  }
}
```

### 3. Install Dependencies

```bash
cd backend/BookStore.API
dotnet restore
```

### 4. Create Database Migration

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 5. Run the Application

```bash
dotnet run
```

The API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `https://localhost:5001/swagger`

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique, Required)
- `password_hash` (String, Required)
- `full_name` (String, Optional)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Books Table
- `id` (UUID, Primary Key)
- `name` (String, Required)
- `category` (String, Required)
- `price` (Decimal, Required)
- `description` (String, Required)
- `user_id` (UUID, Foreign Key, Required)
- `created_at` (DateTime)
- `updated_at` (DateTime)
- `image_url` (String, Optional)
- `file_url` (String, Optional)
- `file_name` (String, Optional)
- `file_size` (Long, Optional)

## Security Features

### Password Security
- Passwords are hashed using BCrypt with salt
- Plain text passwords are never stored
- Password strength validation on registration

### JWT Token Security
- Tokens are signed with a secret key
- Tokens include user ID, email, and expiration
- Tokens are validated on protected endpoints
- Configurable token expiration time

### Authorization
- Users can only access their own books for modification
- Public endpoints for viewing all books
- Protected endpoints require valid JWT tokens

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
```

Common HTTP status codes:
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Development

### Adding New Features

1. **Models**: Add new entity models in the `Models/` folder
2. **DTOs**: Create data transfer objects in the `DTOs/` folder
3. **Repositories**: Implement data access logic in the `Repositories/` folder
4. **Controllers**: Add API endpoints in the `Controllers/` folder
5. **Services**: Add business logic in the `Services/` folder

### Database Migrations

When you modify entity models:

```bash
dotnet ef migrations add MigrationName
dotnet ef database update
```

### Testing

The API can be tested using:
- Swagger UI (available at `/swagger`)
- Postman or similar API testing tools
- Unit tests (to be implemented)

## Deployment

### Environment Variables

For production deployment, set these environment variables:
- `ConnectionStrings__DefaultConnection`: Database connection string
- `JwtSettings__SecretKey`: JWT secret key
- `JwtSettings__Issuer`: JWT issuer
- `JwtSettings__Audience`: JWT audience

### Docker Support

A Dockerfile can be added for containerized deployment:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["BookStore.API.csproj", "."]
RUN dotnet restore "./BookStore.API.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "BookStore.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "BookStore.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BookStore.API.dll"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.
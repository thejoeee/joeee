# Book Store Application

A modern web application for buying, selling, and managing digital books. Built with React, TypeScript frontend and .NET Core Web API backend.

## Features

### 🏪 Public Store
- **Browse Books**: View all available books from all authors
- **Search & Filter**: Find books by title, description, category, and price range
- **Book Details**: Click on any book to view detailed information
- **Download**: Purchase and download books directly

### ✍️ Writers Dashboard
- **Publish Books**: Upload your books with cover images and files
- **Manage Inventory**: Edit, update, or delete your published books
- **Analytics**: View statistics about your book collection
- **File Management**: Upload book files (PDF, EPUB, DOCX) and cover images

### 🔐 Authentication
- **User Registration**: Create an account with email and password
- **Secure Login**: JWT-based authentication via .NET Core API
- **Protected Routes**: Writers dashboard requires authentication
- **User Profiles**: Personalized experience with user metadata

## How It Works

### For Readers/Buyers

1. **Browse the Store**
   - Visit the homepage to see all available books
   - Use search and filters to find specific books
   - View book covers, descriptions, and prices

2. **View Book Details**
   - Click on any book to go to its detail page
   - See full description, file information, and pricing
   - Preview book cover in full size

3. **Download Books**
   - Click "Download Book" button on the detail page
   - File will be automatically downloaded to your device
   - Support for various file formats (PDF, EPUB, DOCX, etc.)

### For Writers/Authors

1. **Access Writers Dashboard**
   - Create an account or log in
   - Navigate to "Writers Dashboard" from the top menu
   - Only authenticated users can access this area

2. **Publish a New Book**
   - Click "Add Book" button
   - Fill in book details (title, category, price, description)
   - Upload a cover image (JPG, PNG, GIF)
   - Upload the book file (PDF, EPUB, DOCX, etc.)
   - Submit to publish

3. **Manage Your Books**
   - View all your published books in the dashboard
   - Edit book details, update files, or change pricing
   - Delete books you no longer want to sell
   - View statistics about your collection

## Technical Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **React Router** for navigation
- **Bootstrap 5** with custom CSS for responsive design
- **Lucide React** for modern icons
- **Vite** for fast development and building
- **Axios** for HTTP requests to the backend API

### Backend
- **.NET Core 8** Web API with Entity Framework Core
- **PostgreSQL** database with Row Level Security (RLS)
- **JWT Authentication** for secure user management
- **File Upload System** for handling book images and files
- **BCrypt** for secure password hashing

### Database Schema

#### Books Table
- `id`: Unique identifier (UUID)
- `name`: Book title
- `category`: Book category/genre
- `price`: Book price in USD
- `description`: Book description
- `user_id`: Author/owner ID (foreign key)
- `image_url`: Cover image URL
- `file_url`: Book file URL
- `file_name`: Original filename
- `file_size`: File size in bytes
- `created_at`: Publication timestamp
- `updated_at`: Last modification timestamp

#### Users Table
- `id`: Unique identifier (UUID)
- `email`: User email address (unique)
- `password_hash`: Hashed password using BCrypt
- `full_name`: User's full name
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Security Features

#### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: BCrypt with salt for secure password storage
- **Protected Endpoints**: API endpoints require valid JWT tokens
- **User Ownership**: Users can only modify their own books

#### File Storage Security
- **Separate Directories**: Images and files stored in different directories
- **File Type Validation**: Only allowed file types can be uploaded
- **Size Limits**: Maximum file sizes enforced (5MB for images, 100MB for books)
- **Unique Filenames**: Prevents conflicts and unauthorized access

## File Upload System

### Supported File Types
- **Images**: JPG, PNG, GIF for book covers
- **Books**: PDF, EPUB, DOCX, DOC, TXT, MOBI, AZW3

### Storage Structure
```
wwwroot/uploads/images/
  ├── {bookId}-{timestamp}.jpg
  └── {bookId}-{timestamp}.png

wwwroot/uploads/books/
  ├── {bookId}-{timestamp}.pdf
  └── {bookId}-{timestamp}.epub
```

### Upload Process
1. Files are uploaded to the .NET Core API via multipart form data
2. Unique filenames prevent conflicts
3. Files are stored in the wwwroot directory for static serving
4. File metadata is stored in the database

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- .NET 8.0 SDK
- PostgreSQL database

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bookstore-app
   ```

2. **Backend Setup**
   ```bash
   cd backend/BookStore.API
   dotnet restore
   ```

3. **Database Configuration**
   Update the connection string in `backend/BookStore.API/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=bookstore;Username=your_username;Password=your_password"
     }
   }
   ```

4. **JWT Configuration**
   Update the JWT settings in `backend/BookStore.API/appsettings.json`:
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

5. **Run Database Migrations**
   ```bash
   cd backend/BookStore.API
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

6. **Start the Backend API**
   ```bash
   cd backend/BookStore.API
   dotnet run
   ```
   The API will be available at `https://localhost:5001`

7. **Frontend Setup**
   ```bash
   cd ../../  # Back to root directory
   npm install
   ```

8. **Environment Variables**
   Create a `.env` file in the root directory:
   ```
   VITE_API_BASE_URL=https://localhost:5001/api
   ```

9. **Start the Frontend**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## API Documentation

The backend API provides the following endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user

### Books
- `GET /api/books` - Get all books (public)
- `GET /api/books/my-books` - Get user's books (authenticated)
- `GET /api/books/{id}` - Get a specific book
- `POST /api/books` - Create a new book (authenticated)
- `PUT /api/books/{id}` - Update a book (authenticated, owner only)
- `DELETE /api/books/{id}` - Delete a book (authenticated, owner only)
- `GET /api/books/categories` - Get all categories

### File Upload
- `POST /api/files/upload-image` - Upload book cover image (authenticated)
- `POST /api/files/upload-book` - Upload book file (authenticated)
- `DELETE /api/files/delete/{fileType}/{fileName}` - Delete uploaded file (authenticated)

For detailed API documentation, visit the Swagger UI at `https://localhost:5001/swagger` when the backend is running.

## User Roles & Permissions

### Anonymous Users
- Browse the public store
- View book details
- Download books (no purchase flow implemented)

### Authenticated Users
- All anonymous user capabilities
- Access to Writers Dashboard
- Upload and manage their own books
- Edit/delete their published books

## File Management

### Upload Limits
- **Images**: Maximum 5MB per file
- **Books**: Maximum 100MB per file

### Supported Formats
- **Images**: JPG, JPEG, PNG, GIF, WebP
- **Books**: PDF, EPUB, DOCX, DOC, TXT, MOBI, AZW3

### Storage Location
Files are stored in the `wwwroot/uploads` directory:
- Images: `wwwroot/uploads/images/`
- Books: `wwwroot/uploads/books/`

## Future Enhancements

- Payment integration for book purchases
- User reviews and ratings
- Book categories management
- Advanced search with full-text search
- Author profiles and following system
- Book recommendations
- Sales analytics for authors
- Bulk upload functionality
- Cloud storage integration (Azure Blob Storage, AWS S3)
- Email notifications
- Book preview functionality

## Development

### Backend Development
The .NET Core API follows clean architecture principles:
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and JWT token management
- **Repositories**: Data access layer with Entity Framework
- **Models**: Entity definitions and database schema
- **DTOs**: Data transfer objects for API communication

### Frontend Development
The React frontend uses modern patterns:
- **Components**: Reusable UI components with TypeScript
- **Services**: API communication layer with Axios
- **Contexts**: State management with React Context
- **Hooks**: Custom hooks for common functionality

### Adding New Features
1. **Backend**: Add new controllers, services, or repositories as needed
2. **Database**: Create migrations for schema changes
3. **Frontend**: Update services and components to use new API endpoints
4. **Types**: Update TypeScript interfaces to match API changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
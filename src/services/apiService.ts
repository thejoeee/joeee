/**
 * API Service for communicating with the .NET Core backend
 * This service handles all HTTP requests to the backend API including authentication,
 * book management, and file uploads. It replaces the previous Supabase integration.
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Define the base URL for the API - this should match your .NET Core API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001/api';

/**
 * Interface definitions for API request/response types
 * These interfaces ensure type safety when communicating with the backend
 */

// Authentication related interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    createdAt: string;
  };
}

// Book related interfaces
export interface Book {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  user?: {
    id: string;
    email: string;
    fullName: string;
    createdAt: string;
  };
}

export interface CreateBookRequest {
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface UpdateBookRequest extends CreateBookRequest {
  // Inherits all properties from CreateBookRequest
}

export interface BookFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

// File upload response interface
export interface FileUploadResponse {
  url: string;
  fileName: string;
  size: number;
}

/**
 * API Service Class
 * This class encapsulates all API communication logic and provides a clean interface
 * for the frontend components to interact with the backend.
 */
class ApiService {
  private api: AxiosInstance;

  constructor() {
    // Create an Axios instance with default configuration
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to automatically include JWT token in requests
    this.api.interceptors.request.use(
      (config) => {
        // Get the JWT token from localStorage
        const token = localStorage.getItem('authToken');
        if (token) {
          // Add the token to the Authorization header
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle authentication errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // If we get a 401 Unauthorized response, clear the stored token
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          // Optionally redirect to login page
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== Authentication Methods ====================

  /**
   * Authenticate a user with email and password
   * @param credentials - User login credentials
   * @returns Promise containing authentication response
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
      
      // Store the JWT token and user data in localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  /**
   * Register a new user account
   * @param userData - User registration data
   * @returns Promise containing authentication response
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData);
      
      // Store the JWT token and user data in localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  /**
   * Log out the current user by clearing stored authentication data
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  /**
   * Check if a user is currently authenticated
   * @returns Boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  /**
   * Get the current user data from localStorage
   * @returns User object or null if not authenticated
   */
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // ==================== Book Management Methods ====================

  /**
   * Fetch all books from the public store
   * @param filters - Optional filters to apply to the book search
   * @returns Promise containing array of books
   */
  async getAllBooks(filters?: BookFilters): Promise<Book[]> {
    try {
      const params = new URLSearchParams();
      
      // Add filter parameters if provided
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

      const response: AxiosResponse<Book[]> = await this.api.get(`/books?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch books');
    }
  }

  /**
   * Fetch books belonging to the current authenticated user
   * @param filters - Optional filters to apply to the book search
   * @returns Promise containing array of user's books
   */
  async getMyBooks(filters?: BookFilters): Promise<Book[]> {
    try {
      const params = new URLSearchParams();
      
      // Add filter parameters if provided
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

      const response: AxiosResponse<Book[]> = await this.api.get(`/books/my-books?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch your books');
    }
  }

  /**
   * Fetch a specific book by its ID
   * @param id - The book ID
   * @returns Promise containing the book data
   */
  async getBookById(id: string): Promise<Book> {
    try {
      const response: AxiosResponse<Book> = await this.api.get(`/books/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch book');
    }
  }

  /**
   * Create a new book
   * @param bookData - The book data to create
   * @returns Promise containing the created book
   */
  async createBook(bookData: CreateBookRequest): Promise<Book> {
    try {
      const response: AxiosResponse<Book> = await this.api.post('/books', bookData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create book');
    }
  }

  /**
   * Update an existing book
   * @param id - The book ID to update
   * @param bookData - The updated book data
   * @returns Promise containing the updated book
   */
  async updateBook(id: string, bookData: UpdateBookRequest): Promise<Book> {
    try {
      const response: AxiosResponse<Book> = await this.api.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update book');
    }
  }

  /**
   * Delete a book
   * @param id - The book ID to delete
   * @returns Promise that resolves when deletion is complete
   */
  async deleteBook(id: string): Promise<void> {
    try {
      await this.api.delete(`/books/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete book');
    }
  }

  /**
   * Get all available book categories
   * @returns Promise containing array of category names
   */
  async getCategories(): Promise<string[]> {
    try {
      const response: AxiosResponse<string[]> = await this.api.get('/books/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  }

  // ==================== File Upload Methods ====================

  /**
   * Upload a book cover image
   * @param file - The image file to upload
   * @param bookId - Optional book ID for organizing files
   * @returns Promise containing the upload response with file URL
   */
  async uploadBookImage(file: File, bookId?: string): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (bookId) {
        formData.append('bookId', bookId);
      }

      const response: AxiosResponse<FileUploadResponse> = await this.api.post('/files/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
  }

  /**
   * Upload a book file (PDF, EPUB, etc.)
   * @param file - The book file to upload
   * @param bookId - Optional book ID for organizing files
   * @returns Promise containing the upload response with file URL and metadata
   */
  async uploadBookFile(file: File, bookId?: string): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (bookId) {
        formData.append('bookId', bookId);
      }

      const response: AxiosResponse<FileUploadResponse> = await this.api.post('/files/upload-book', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload book file');
    }
  }

  /**
   * Delete an uploaded file
   * @param fileName - The name of the file to delete
   * @param fileType - The type of file ('images' or 'books')
   * @returns Promise that resolves when deletion is complete
   */
  async deleteFile(fileName: string, fileType: 'images' | 'books'): Promise<void> {
    try {
      await this.api.delete(`/files/delete/${fileType}/${fileName}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete file');
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Download a file from a given URL
   * This method triggers a browser download of the specified file
   * @param fileUrl - The URL of the file to download
   * @param fileName - The name to save the file as
   */
  async downloadFile(fileUrl: string, fileName: string): Promise<void> {
    try {
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      throw new Error('Failed to download file');
    }
  }
}

// Export a singleton instance of the API service
export const apiService = new ApiService();
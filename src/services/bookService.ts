import { supabase } from '../lib/supabase';
import { Book, CreateBookRequest, UpdateBookRequest, BookFilters } from '../types/Book';

export class BookService {
  async getAllBooks(filters?: BookFilters): Promise<Book[]> {
    let query = supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply search filter
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply category filter
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    // Apply price filters
    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch books: ${error.message}`);
    }

    return data || [];
  }

  async getBookById(id: string): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch book: ${error.message}`);
    }

    if (!data) {
      throw new Error('Book not found');
    }

    return data;
  }

  async createBook(book: CreateBookRequest): Promise<Book> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('books')
      .insert({
        ...book,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create book: ${error.message}`);
    }

    return data;
  }

  async updateBook(book: UpdateBookRequest): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .update({
        name: book.name,
        category: book.category,
        price: book.price,
        description: book.description,
        image_url: book.image_url,
        file_url: book.file_url,
        file_name: book.file_name,
        file_size: book.file_size,
        updated_at: new Date().toISOString(),
      })
      .eq('id', book.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update book: ${error.message}`);
    }

    return data;
  }

  async deleteBook(id: string): Promise<void> {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete book: ${error.message}`);
    }
  }

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('books')
      .select('category')
      .order('category');

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    // Get unique categories
    const categories = [...new Set(data?.map(item => item.category) || [])];
    return categories;
  }

  async getBookStats(): Promise<{
    totalBooks: number;
    totalValue: number;
    categoriesCount: number;
  }> {
    const { data, error } = await supabase
      .from('books')
      .select('price, category');

    if (error) {
      throw new Error(`Failed to fetch book stats: ${error.message}`);
    }

    const totalBooks = data?.length || 0;
    const totalValue = data?.reduce((sum, book) => sum + book.price, 0) || 0;
    const categoriesCount = new Set(data?.map(book => book.category)).size;

    return {
      totalBooks,
      totalValue,
      categoriesCount,
    };
  }
}

export const bookService = new BookService();
import { Database } from './database';

export type Book = Database['public']['Tables']['books']['Row'];
export type BookInsert = Database['public']['Tables']['books']['Insert'];
export type BookUpdate = Database['public']['Tables']['books']['Update'];

export interface CreateBookRequest {
  name: string;
  category: string;
  price: number;
  description: string;
  image_url?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

export interface UpdateBookRequest {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

export interface BookFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}
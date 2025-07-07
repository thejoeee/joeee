export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          name: string
          category: string
          price: number
          description: string
          user_id: string
          created_at: string
          updated_at: string
          image_url: string | null
          file_url: string | null
          file_name: string | null
          file_size: number | null
        }
        Insert: {
          id?: string
          name: string
          category: string
          price: number
          description: string
          user_id: string
          created_at?: string
          updated_at?: string
          image_url?: string | null
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
        }
        Update: {
          id?: string
          name?: string
          category?: string
          price?: number
          description?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          image_url?: string | null
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
import { supabase } from '../lib/supabase';

export class StorageService {
  private readonly BOOK_IMAGES_BUCKET = 'book-images';
  private readonly BOOK_FILES_BUCKET = 'book-files';

  async uploadBookImage(file: File, bookId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${bookId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(this.BOOK_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from(this.BOOK_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async uploadBookFile(file: File, bookId: string): Promise<{ url: string; fileName: string; fileSize: number }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${bookId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(this.BOOK_FILES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from(this.BOOK_FILES_BUCKET)
      .getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      fileName: file.name,
      fileSize: file.size
    };
  }

  async deleteBookImage(imageUrl: string): Promise<void> {
    try {
      const fileName = this.extractFileNameFromUrl(imageUrl);
      if (fileName) {
        await supabase.storage
          .from(this.BOOK_IMAGES_BUCKET)
          .remove([fileName]);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  async deleteBookFile(fileUrl: string): Promise<void> {
    try {
      const fileName = this.extractFileNameFromUrl(fileUrl);
      if (fileName) {
        await supabase.storage
          .from(this.BOOK_FILES_BUCKET)
          .remove([fileName]);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  private extractFileNameFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    } catch {
      return null;
    }
  }

  async downloadFile(fileUrl: string, fileName: string): Promise<void> {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('Failed to download file');
    }
  }
}

export const storageService = new StorageService();
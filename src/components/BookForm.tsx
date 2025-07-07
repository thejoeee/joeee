import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col, ProgressBar } from 'react-bootstrap';
import { Book, CreateBookRequest, UpdateBookRequest, apiService } from '../services/apiService';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

/**
 * BookForm Component Props Interface
 */
interface BookFormProps {
  show: boolean;
  onHide: () => void;
  book?: Book | null;
  onSave: () => void;
}

/**
 * BookForm Component
 * This component provides a modal form for creating and editing books.
 * It handles file uploads for both book cover images and book files,
 * form validation, and API communication.
 */
const BookForm: React.FC<BookFormProps> = ({ show, onHide, book, onSave }) => {
  // Form state
  const [formData, setFormData] = useState<CreateBookRequest>({
    name: '',
    category: '',
    price: 0,
    description: '',
    imageUrl: '',
    fileUrl: '',
    fileName: '',
    fileSize: 0,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categories] = useState([
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Romance',
    'Thriller',
    'Biography',
    'History',
    'Self-Help',
    'Business',
    'Technology',
    'Education',
    'Children',
    'Young Adult',
    'Poetry',
    'Drama',
    'Horror',
    'Adventure',
    'Other'
  ]);

  // Initialize form data when book prop changes
  useEffect(() => {
    if (book) {
      setFormData({
        name: book.name,
        category: book.category,
        price: book.price,
        description: book.description,
        imageUrl: book.imageUrl || '',
        fileUrl: book.fileUrl || '',
        fileName: book.fileName || '',
        fileSize: book.fileSize || 0,
      });
      setImagePreview(book.imageUrl || '');
    } else {
      resetForm();
    }
  }, [book]);

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: 0,
      description: '',
      imageUrl: '',
      fileUrl: '',
      fileName: '',
      fileSize: 0,
    });
    setImageFile(null);
    setBookFile(null);
    setImagePreview('');
    setError('');
    setUploadProgress(0);
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (field: keyof CreateBookRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Handle image file selection
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }

      setImageFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle book file selection
   */
  const handleBookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/epub+zip',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'application/x-mobipocket-ebook',
      ];
      
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const allowedExtensions = ['pdf', 'epub', 'docx', 'doc', 'txt', 'mobi', 'azw3'];
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
        setError('Please select a valid book file (PDF, EPUB, DOCX, DOC, TXT, MOBI, AZW3)');
        return;
      }

      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        setError('Book file size must be less than 100MB');
        return;
      }

      setBookFile(file);
      setError('');
    }
  };

  /**
   * Remove selected image
   */
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  /**
   * Remove selected book file
   */
  const removeBookFile = () => {
    setBookFile(null);
    setFormData(prev => ({ 
      ...prev, 
      fileUrl: '', 
      fileName: '', 
      fileSize: 0 
    }));
  };

  /**
   * Upload files and get URLs
   */
  const uploadFiles = async (): Promise<{ imageUrl?: string; fileUrl?: string; fileName?: string; fileSize?: number }> => {
    const result: { imageUrl?: string; fileUrl?: string; fileName?: string; fileSize?: number } = {};

    try {
      // Upload image if selected
      if (imageFile) {
        setUploadProgress(25);
        const imageResponse = await apiService.uploadBookImage(imageFile, book?.id);
        result.imageUrl = imageResponse.url;
        setUploadProgress(50);
      }

      // Upload book file if selected
      if (bookFile) {
        setUploadProgress(75);
        const fileResponse = await apiService.uploadBookFile(bookFile, book?.id);
        result.fileUrl = fileResponse.url;
        result.fileName = fileResponse.fileName;
        result.fileSize = fileResponse.size;
        setUploadProgress(100);
      }

      return result;
    } catch (error: any) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploadProgress(0);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Book name is required');
      }
      if (!formData.category) {
        throw new Error('Category is required');
      }
      if (formData.price < 0) {
        throw new Error('Price must be a positive number');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }

      // Upload files if any are selected
      const uploadResults = await uploadFiles();

      // Prepare final form data
      const finalFormData: CreateBookRequest | UpdateBookRequest = {
        ...formData,
        imageUrl: uploadResults.imageUrl || formData.imageUrl,
        fileUrl: uploadResults.fileUrl || formData.fileUrl,
        fileName: uploadResults.fileName || formData.fileName,
        fileSize: uploadResults.fileSize || formData.fileSize,
      };

      // Create or update book
      if (book) {
        await apiService.updateBook(book.id, finalFormData as UpdateBookRequest);
      } else {
        await apiService.createBook(finalFormData);
      }

      // Success - call onSave callback
      onSave();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the book');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onHide();
    }
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {book ? 'Edit Book' : 'Add New Book'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-3">
              <small className="text-muted">Uploading files...</small>
              <ProgressBar now={uploadProgress} className="mt-1" />
            </div>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Book Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter book name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Price (USD) *</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  required
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Enter book description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center">
                  <ImageIcon size={16} className="me-2" />
                  Book Cover Image
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                </Form.Text>
                
                {imagePreview && (
                  <div className="mt-2 position-relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                      className="rounded"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-1"
                      onClick={removeImage}
                      disabled={loading}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center">
                  <FileText size={16} className="me-2" />
                  Book File
                </Form.Label>
                <Form.Control
                  type="file"
                  accept=".pdf,.epub,.docx,.doc,.txt,.mobi,.azw3"
                  onChange={handleBookFileChange}
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Supported formats: PDF, EPUB, DOCX, DOC, TXT, MOBI, AZW3 (Max 100MB)
                </Form.Text>
                
                {bookFile && (
                  <div className="mt-2 p-2 bg-light rounded d-flex align-items-center justify-content-between">
                    <div>
                      <div className="fw-bold">{bookFile.name}</div>
                      <small className="text-muted">{formatFileSize(bookFile.size)}</small>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={removeBookFile}
                      disabled={loading}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                )}
                
                {formData.fileName && !bookFile && (
                  <div className="mt-2 p-2 bg-light rounded">
                    <div className="fw-bold">{formData.fileName}</div>
                    {formData.fileSize && (
                      <small className="text-muted">{formatFileSize(formData.fileSize)}</small>
                    )}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="d-flex align-items-center"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {book ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Upload size={16} className="me-2" />
                {book ? 'Update Book' : 'Create Book'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BookForm;
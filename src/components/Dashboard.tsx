import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Badge } from 'react-bootstrap';
import { Book, BookFilters, apiService } from '../services/apiService';
import BookForm from './BookForm';
import Navbar from './Navbar';
import { Search, Plus, Edit, Trash2, BookOpen, DollarSign, TrendingUp, Hash, Layers } from 'lucide-react';

/**
 * Dashboard Component
 * This component provides the writers dashboard where authenticated users can
 * manage their published books. It includes functionality for viewing, creating,
 * editing, and deleting books, as well as displaying statistics.
 */
const Dashboard: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<BookFilters>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalValue: 0,
    categoriesCount: 0,
  });

  // Load initial data when component mounts
  useEffect(() => {
    loadInitialData();
  }, []);

  // Reload books when filters change
  useEffect(() => {
    loadBooks();
  }, [filters]);

  /**
   * Load all initial data including books, categories, and statistics
   */
  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadBooks(),
        loadCategories(),
        loadStats(),
      ]);
    } catch (err: any) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load books belonging to the current user
   * Applies any active filters to the request
   */
  const loadBooks = async () => {
    try {
      // Load books for the current user with applied filters
      const booksData = await apiService.getMyBooks(filters);
      setBooks(booksData);
      setError('');
    } catch (err: any) {
      setError('Failed to load books. Please try again.');
      console.error('Error loading books:', err);
    }
  };

  /**
   * Load all available book categories
   */
  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Error loading categories:', err);
    }
  };

  /**
   * Calculate and load statistics for the user's books
   */
  const loadStats = async () => {
    try {
      // Get all user's books to calculate statistics
      const allBooks = await apiService.getMyBooks();
      
      const totalBooks = allBooks.length;
      const totalValue = allBooks.reduce((sum, book) => sum + book.price, 0);
      const categoriesCount = new Set(allBooks.map(book => book.category)).size;
      
      setStats({
        totalBooks,
        totalValue,
        categoriesCount,
      });
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  /**
   * Handle filter changes and update the filters state
   */
  const handleFilterChange = (key: keyof BookFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  /**
   * Clear all active filters
   */
  const clearFilters = () => {
    setFilters({});
  };

  /**
   * Open the book form modal for creating a new book
   */
  const handleAddBook = () => {
    setEditingBook(null);
    setShowBookForm(true);
  };

  /**
   * Open the book form modal for editing an existing book
   */
  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowBookForm(true);
  };

  /**
   * Open the delete confirmation modal
   */
  const handleDeleteBook = (book: Book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  /**
   * Confirm and execute book deletion
   */
  const confirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      await apiService.deleteBook(bookToDelete.id);
      await loadInitialData();
      setShowDeleteModal(false);
      setBookToDelete(null);
    } catch (err: any) {
      setError('Failed to delete book. Please try again.');
    }
  };

  /**
   * Close the book form modal
   */
  const handleBookFormClose = () => {
    setShowBookForm(false);
    setEditingBook(null);
  };

  /**
   * Handle successful book save operation
   */
  const handleBookSaved = () => {
    loadInitialData();
    handleBookFormClose();
  };

  /**
   * Get a consistent color for book category badges
   */
  const getCategoryColor = (category: string) => {
    const colors = ['primary', 'success', 'info', 'warning', 'secondary', 'danger'];
    const index = category.length % colors.length;
    return colors[index];
  };

  /**
   * Format price as currency
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Container fluid className="py-4">
        <div className="dashboard-header text-center mb-4">
          <Container>
            <h1 className="display-4 mb-2">
              <BookOpen className="me-3" size={48} />
              Writers Dashboard
            </h1>
            <p className="lead">Manage your published books</p>
          </Container>
        </div>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="stats-card h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="stats-icon me-3">
                  <Hash size={32} className="text-primary" />
                </div>
                <div>
                  <h3 className="mb-0">{stats.totalBooks}</h3>
                  <p className="text-muted mb-0">Total Books</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stats-card h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="stats-icon me-3">
                  <TrendingUp size={32} className="text-success" />
                </div>
                <div>
                  <h3 className="mb-0">{formatPrice(stats.totalValue)}</h3>
                  <p className="text-muted mb-0">Total Value</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stats-card h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="stats-icon me-3">
                  <Layers size={32} className="text-info" />
                </div>
                <div>
                  <h3 className="mb-0">{stats.categoriesCount}</h3>
                  <p className="text-muted mb-0">Categories</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <div className="search-container">
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="d-flex align-items-center">
                  <Search size={16} className="me-2" />
                  Search Books
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name or description..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Min Price</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Max Price</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="999.99"
                  step="0.01"
                  min="0"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col md={1}>
              <Button
                variant="outline-secondary"
                onClick={clearFilters}
                className="w-100"
                title="Clear Filters"
              >
                Clear
              </Button>
            </Col>
            <Col md={2}>
              <Button
                variant="primary"
                onClick={handleAddBook}
                className="w-100 d-flex align-items-center justify-content-center"
              >
                <Plus size={16} className="me-2" />
                Add Book
              </Button>
            </Col>
          </Row>
        </div>

        {/* Books Grid */}
        <Row className="g-4">
          {books.length === 0 ? (
            <Col xs={12}>
              <Card className="text-center py-5">
                <Card.Body>
                  <BookOpen size={64} className="text-muted mb-3" />
                  <h4 className="text-muted">No books found</h4>
                  <p className="text-muted">
                    {Object.keys(filters).some(key => filters[key as keyof BookFilters])
                      ? "Try adjusting your search criteria."
                      : "Start by adding your first book to the collection."
                    }
                  </p>
                  <Button variant="primary" onClick={handleAddBook}>
                    <Plus size={16} className="me-2" />
                    Add Your First Book
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            books.map((book) => (
              <Col key={book.id} md={6} lg={4} xl={3}>
                <Card className="book-card h-100">
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-3">
                      <Badge bg={getCategoryColor(book.category)} className="mb-2">
                        {book.category}
                      </Badge>
                      <Card.Title className="h5 mb-2">{book.name}</Card.Title>
                      <Card.Text className="text-muted small flex-grow-1">
                        {book.description}
                      </Card.Text>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center text-success">
                          <DollarSign size={16} />
                          <strong>{book.price.toFixed(2)}</strong>
                        </div>
                        <small className="text-muted">
                          {new Date(book.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditBook(book)}
                          className="flex-fill d-flex align-items-center justify-content-center"
                        >
                          <Edit size={14} className="me-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteBook(book)}
                          className="flex-fill d-flex align-items-center justify-content-center"
                        >
                          <Trash2 size={14} className="me-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>

        {/* Book Form Modal */}
        <BookForm
          show={showBookForm}
          onHide={handleBookFormClose}
          book={editingBook}
          onSave={handleBookSaved}
        />

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete "{bookToDelete?.name}"? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Book
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Dashboard;
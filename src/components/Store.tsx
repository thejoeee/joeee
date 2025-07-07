import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Book, BookFilters, apiService } from '../services/apiService';
import Navbar from './Navbar';
import { Search, DollarSign, Download, BookOpen, Filter } from 'lucide-react';

/**
 * Store Component
 * This component displays the public book store where all users can browse
 * and view books from all authors. It provides filtering capabilities and
 * navigation to individual book download pages.
 */
const Store: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<BookFilters>({});
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  // Load initial data when component mounts
  useEffect(() => {
    loadInitialData();
  }, []);

  // Reload books when filters change
  useEffect(() => {
    loadBooks();
  }, [filters]);

  /**
   * Load all initial data including books and categories
   */
  const loadInitialData = async () => {
    try {
      setError(null);
      setLoading(true);
      await Promise.all([
        loadBooks(),
        loadCategories()
      ]);
      // Load data sequentially to avoid multiple error states
      await loadBooks();
      await loadCategories();
    } catch (err: any) {
      setError('Failed to load store data. Please try again.');
      // Error is already handled in individual load functions
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load all books from the public store
   * Applies any active filters to the request
   */
  const loadBooks = async () => {
    try {
      const booksData = await apiService.getAllBooks(filters);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setBooks(booksData);
      setError('');
    } catch (err: any) {
      setError('Failed to load books. Please try again.');
      console.error('Error loading books:', err);
      // Fallback to empty array instead of throwing error
      setBooks([]);
      setError('Unable to connect to server. Please check if the backend is running.');
    }
  };

  /**
   * Load all available book categories
   */
  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setCategories(categoriesData);
    } catch (err: any) {
      // Fallback to empty array instead of throwing error
      setCategories([]);
      setError('Unable to connect to server. Please check if the backend is running.');
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
   * Navigate to the book download page
   */
  const handleBookClick = (book: Book) => {
    navigate(`/download/${book.id}`);
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
        <div className="store-header text-center mb-4">
          <Container>
            <h1 className="display-4 mb-2">
              <BookOpen className="me-3" size={48} />
              Book Store
            </h1>
            <p className="lead">Discover and download amazing books from our community of writers</p>
          </Container>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="search-container">
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="d-flex align-items-center">
                  <Search size={16} className="me-2" />
                  Search Books
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by title or description..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="d-flex align-items-center">
                  <Filter size={16} className="me-2" />
                  Category
                </Form.Label>
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
                      : "No books are currently available in the store."
                    }
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            books.map((book) => (
              <Col key={book.id} md={6} lg={4} xl={3}>
                <Card 
                  className="book-card h-100 cursor-pointer" 
                  onClick={() => handleBookClick(book)}
                  style={{ cursor: 'pointer' }}
                >
                  {book.imageUrl && (
                    <Card.Img 
                      variant="top" 
                      src={book.imageUrl} 
                      style={{ height: '200px', objectFit: 'cover' }}
                      alt={book.name}
                    />
                  )}
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-3">
                      <Badge bg={getCategoryColor(book.category)} className="mb-2">
                        {book.category}
                      </Badge>
                      <Card.Title className="h5 mb-2">{book.name}</Card.Title>
                      <Card.Text className="text-muted small flex-grow-1">
                        {book.description.length > 100 
                          ? `${book.description.substring(0, 100)}...` 
                          : book.description
                        }
                      </Card.Text>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center text-success">
                          <DollarSign size={16} />
                          <strong>{formatPrice(book.price)}</strong>
                        </div>
                        <small className="text-muted">
                          {new Date(book.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-100 d-flex align-items-center justify-content-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookClick(book);
                        }}
                      >
                        <Download size={14} className="me-1" />
                        View & Download
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
    </div>
  );
};

export default Store;
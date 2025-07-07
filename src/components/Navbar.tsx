import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogOut, User, PenTool, Store } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  return (
    <BootstrapNavbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <BootstrapNavbar.Brand 
          onClick={() => navigate('/')} 
          className="d-flex align-items-center cursor-pointer"
          style={{ cursor: 'pointer' }}
        >
          <BookOpen className="me-2" size={24} />
          Book Store
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              onClick={() => navigate('/')}
              className={`d-flex align-items-center ${location.pathname === '/' ? 'active' : ''}`}
            >
              <Store size={16} className="me-1" />
              Store
            </Nav.Link>
            {isAuthenticated && (
              <Nav.Link 
                onClick={() => navigate('/writers')}
                className={`d-flex align-items-center ${location.pathname === '/writers' ? 'active' : ''}`}
              >
                <PenTool size={16} className="me-1" />
                Writers Dashboard
              </Nav.Link>
            )}
          </Nav>
          
          <Nav className="d-flex align-items-center">
            {isAuthenticated ? (
              <>
                <Nav.Item className="d-flex align-items-center me-3">
                  <User size={18} className="me-2" />
                  <span className="text-muted">Welcome, {getUserDisplayName()}</span>
                </Nav.Item>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={handleLogout}
                  className="d-flex align-items-center"
                >
                  <LogOut size={16} className="me-1" />
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => navigate('/login')}
                className="d-flex align-items-center"
              >
                <User size={16} className="me-1" />
                Login
              </Button>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
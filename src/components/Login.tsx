import React, { useState } from 'react';
import { Form, Button, Alert, Card, Container, Row, Col, Nav } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, User } from 'lucide-react';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      if (!fullName.trim()) {
        setError('Full name is required');
        return;
      }
    }

    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
        setSuccess('Account created successfully! Please check your email to verify your account.');
        setIsSignUp(false);
        // Reset form
        setEmail('');
        setPassword('');
        setFullName('');
        setConfirmPassword('');
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
  };

  return (
    <div className="login-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="login-card">
              <Card.Body>
                <div className="text-center mb-4">
                  <BookOpen size={48} className="text-primary mb-3" />
                  <h2 className="text-dark mb-2">Book Store</h2>
                  <p className="text-muted">
                    {isSignUp ? 'Create your account' : 'Sign in to your account'}
                  </p>
                </div>

                <Nav variant="pills" className="justify-content-center mb-4">
                  <Nav.Item>
                    <Nav.Link 
                      active={!isSignUp} 
                      onClick={() => !loading && toggleMode()}
                      disabled={loading}
                    >
                      Sign In
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={isSignUp} 
                      onClick={() => !loading && toggleMode()}
                      disabled={loading}
                    >
                      Sign Up
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  {isSignUp && (
                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <User size={16} className="me-2" />
                        Full Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={isSignUp}
                        className="py-2"
                      />
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label className="d-flex align-items-center">
                      <Mail size={16} className="me-2" />
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="d-flex align-items-center">
                      <Lock size={16} className="me-2" />
                      Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="py-2"
                    />
                    {isSignUp && (
                      <Form.Text className="text-muted">
                        Password must be at least 6 characters long
                      </Form.Text>
                    )}
                  </Form.Group>

                  {isSignUp && (
                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex align-items-center">
                        <Lock size={16} className="me-2" />
                        Confirm Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={isSignUp}
                        className="py-2"
                      />
                    </Form.Group>
                  )}

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="w-100 py-2"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isSignUp ? 'Creating Account...' : 'Signing In...'}
                      </>
                    ) : (
                      isSignUp ? 'Create Account' : 'Sign In'
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <Button 
                      variant="link" 
                      className="p-0" 
                      onClick={toggleMode}
                      disabled={loading}
                    >
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </Button>
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
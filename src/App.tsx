import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Store from './components/Store';
import DownloadPage from './components/DownloadPage';

/**
 * Main App Component
 * This component sets up the routing structure and provides authentication context
 * to the entire application. It defines the main routes and their access controls.
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public route - Store page accessible to all users */}
            <Route path="/" element={<Store />} />
            
            {/* Public route - Login/Register page */}
            <Route path="/login" element={<Login />} />
            
            {/* Public route - Book download page accessible to all users */}
            <Route path="/download/:bookId" element={<DownloadPage />} />
            
            {/* Protected route - Writers dashboard only for authenticated users */}
            <Route 
              path="/writers" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/apiService';

// Define interfaces for authentication context
interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to access the authentication context
 * This hook provides access to authentication state and methods throughout the app
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * This component manages authentication state and provides authentication methods
 * to all child components through React Context.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app startup
    const initializeAuth = () => {
      try {
        // Get user data from localStorage if available
        const storedUser = apiService.getCurrentUser();
        const isAuth = apiService.isAuthenticated();
        
        if (isAuth && storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear any invalid stored data
        apiService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Register a new user account
   * @param email - User's email address
   * @param password - User's password
   * @param fullName - User's full name
   */
  const signUp = async (email: string, password: string, fullName: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await apiService.register({
        email,
        password,
        fullName,
      });

      // Set the authenticated user
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in an existing user
   * @param email - User's email address
   * @param password - User's password
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await apiService.login({
        email,
        password,
      });

      // Set the authenticated user
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      // Clear authentication data
      apiService.logout();
      setUser(null);
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Create the context value object
  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
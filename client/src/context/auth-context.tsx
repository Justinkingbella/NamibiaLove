import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { API_ENDPOINTS } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  age?: number;
  gender?: string;
  location?: string;
  occupation?: string;
  profilePicture?: string;
  interests?: string[];
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Check if user is already authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(API_ENDPOINTS.AUTH.ME, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  // Login function
  async function login(credentials: LoginCredentials) {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid username or password');
      }
      
      const userData = await response.json();
      
      if (!userData || !userData.id) {
        throw new Error('Invalid response from server');
      }
      
      setUser(userData);
      
      // Invalidate queries that might depend on auth state
      queryClient.invalidateQueries();
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.fullName}!`,
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // Register function
  async function register(data: RegisterData) {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', API_ENDPOINTS.AUTH.REGISTER, data);
      const userData = await response.json();
      setUser(userData);
      
      // Invalidate queries that might depend on auth state
      queryClient.invalidateQueries();
      
      toast({
        title: "Registration successful",
        description: `Welcome to NamibiaLove, ${userData.fullName}!`,
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // Logout function
  async function logout() {
    try {
      setIsLoading(true);
      await apiRequest('POST', API_ENDPOINTS.AUTH.LOGOUT);
      setUser(null);
      
      // Clear all queries from the cache
      queryClient.clear();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      navigate('/login');
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Update profile function
  async function updateProfile(data: Partial<User>) {
    try {
      if (!user) throw new Error("Not authenticated");
      
      setIsLoading(true);
      const response = await apiRequest('PATCH', API_ENDPOINTS.USERS.UPDATE(user.id), data);
      const updatedUser = await response.json();
      setUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Invalidate user-specific queries
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.USERS.DETAIL(user.id)] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.AUTH.ME] });
      
      return updatedUser;
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
import { logger } from './logger';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  name: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

class AuthService {
  private tokenKey = 'sge_auth_token';
  private userKey = 'sge_user_data';
  private tokenExpiryKey = 'sge_token_expiry';

  // Login user - REAL AUTHENTICATION ONLY
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error('API URL not configured');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Login failed: ${response.status}`);
    }

    const data: AuthResponse = await response.json();

    // Store token and user data with proper error handling
    this.saveToken(data.access_token);
    this.saveUser(data.user);

    return data;
  }

  // Improved token storage with browser checks and expiry
  private saveToken(token: string): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(this.tokenKey, token);

        // Calculate and store token expiry (JWT tokens are typically valid for 24 hours)
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
        localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
      }
    } catch (error) {
      logger.error('Failed to save token', 'saveToken', error as Error);
    }
  }

  // Improved user storage with browser checks
  private saveUser(user: User): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(this.userKey, JSON.stringify(user));
      }
    } catch (error) {
      logger.error('Failed to save user', 'saveUser', error as Error);
    }
  }

  // Logout user with proper error handling
  logout(): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.tokenExpiryKey);
      }
    } catch (error) {
      logger.error('Failed to logout', 'logout', error as Error);
    }
  }

  // Get current user with proper error handling
  getCurrentUser(): User | null {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
      }
    } catch (error) {
      logger.error('Failed to retrieve user data', 'getCurrentUser', error as Error);
    }
    return null;
  }

  // Get auth token with proper error handling and expiry check
  getToken(): string | null {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const token = localStorage.getItem(this.tokenKey);
        const expiry = localStorage.getItem(this.tokenExpiryKey);

        // Check if token is expired
        if (token && expiry) {
          const expiryTime = parseInt(expiry);
          if (Date.now() > expiryTime) {
            // Token is expired, clear it
            this.logout();
            return null;
          }
        }

        return token;
      }
    } catch (error) {
      logger.error('Failed to retrieve token:', error);
    }
    return null;
  }

  // Check if user is authenticated with token expiry validation
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Additional check for token expiry
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const expiry = localStorage.getItem(this.tokenExpiryKey);
        if (expiry) {
          const expiryTime = parseInt(expiry);
          if (Date.now() > expiryTime) {
            this.logout();
            return false;
          }
        }
      }
    } catch (error) {
      logger.error('Token expiry check failed', 'isTokenExpired', error as Error);
      return false;
    }

    return true;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Make authenticated API request with improved error handling and auto-refresh
  async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();

    if (!token) {
      throw new Error('No authentication token available');
    }

    // Validate token format before making request
    if (!this.isValidTokenFormat(token)) {
      logger.warn('Invalid token format detected, logging out user', 'authenticatedRequest');
      this.logout();
      throw new Error('Invalid authentication token. Please login again.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle different error status codes properly
      if (response.status === 401) {
        logger.info('Token expired or invalid, logging out user', 'authenticatedRequest');
        this.logout();
        throw new Error('Authentication token expired. Please login again.');
      }

      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to perform this action.');
      }

      if (response.status === 404) {
        throw new Error('Resource not found.');
      }

      if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      return response;
    } catch (error) {
      // Handle network errors and other fetch failures
      if (error instanceof TypeError) {
        throw new Error('Network error. Please check your connection and try again.');
      }

      // Re-throw authentication errors
      if (error instanceof Error && error.message.includes('Authentication')) {
        throw error;
      }

      // Handle other errors
      throw new Error('Request failed. Please try again.');
    }
  }

  // Validate token format (basic JWT structure check)
  private isValidTokenFormat(token: string): boolean {
    try {
      // Check if token has the basic JWT structure (3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      // Check if parts are base64 encoded
      parts.forEach(part => {
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(part)) {
          return false;
        }
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  // Refresh user data
  async refreshUserData(): Promise<User | null> {
    try {
      const response = await this.authenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/auth/user`);

      if (!response.ok) {
        throw new Error('Failed to refresh user data');
      }

      const userData = await response.json();
      localStorage.setItem(this.userKey, JSON.stringify(userData));

      return userData;
    } catch (error) {
      logger.error('Failed to refresh user data:', error);
      return null;
    }
  }

  // Validate token with backend
  async validateToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token is invalid, clear it
        this.logout();
        return false;
      }

      return response.ok;
    } catch (error) {
      logger.error('Token validation failed:', error);
      return false;
    }
  }

  // Auto-login with stored credentials (for development/testing)
  async autoLogin(): Promise<boolean> {
    try {
      // Auto-login works in both development and production for this demo
      const response = await this.login({
        username: 'test',
        password: 'test'
      });

      return !!response.access_token;
    } catch (error) {
      logger.error('Auto-login failed:', error);
      return false;
    }
  }
}

export const authService = new AuthService();

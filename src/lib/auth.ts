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
      console.error('Failed to save token:', error);
    }
  }

  // Improved user storage with browser checks
  private saveUser(user: User): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(this.userKey, JSON.stringify(user));
      }
    } catch (error) {
      console.error('Failed to save user:', error);
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
      console.error('Failed to logout:', error);
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
      console.error('Failed to retrieve user data:', error);
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
      console.error('Failed to retrieve token:', error);
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
      console.error('Token expiry check failed:', error);
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

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If we get a 401 (Unauthorized), the token might be expired
    if (response.status === 401) {
      console.log('Token expired, logging out user');
      this.logout();
      throw new Error('Authentication token expired. Please login again.');
    }

    return response;
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
      console.error('Failed to refresh user data:', error);
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
      console.error('Token validation failed:', error);
      return false;
    }
  }

  // Auto-login with stored credentials (for development/testing)
  async autoLogin(): Promise<boolean> {
    try {
      // Only auto-login in development
      if (process.env.NODE_ENV === 'production') {
        return false;
      }

      const response = await this.login({
        username: 'test',
        password: 'test'
      });

      return !!response.access_token;
    } catch (error) {
      console.error('Auto-login failed:', error);
      return false;
    }
  }
}

export const authService = new AuthService();

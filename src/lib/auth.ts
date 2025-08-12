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

  // Improved token storage with browser checks
  private saveToken(token: string): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(this.tokenKey, token);
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

  // Get auth token with proper error handling
  getToken(): string | null {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        return localStorage.getItem(this.tokenKey);
      }
    } catch (error) {
      console.error('Failed to retrieve token:', error);
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
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

  // Make authenticated API request with improved error handling
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

    return fetch(url, {
      ...options,
      headers,
    });
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

      return response.ok;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
}

export const authService = new AuthService();

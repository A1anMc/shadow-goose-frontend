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

  // Mock login for development (no backend required)
  async mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    // Create a mock user for development
    const mockUser: User = {
      id: 1,
      username: credentials.username || 'test',
      email: 'test@shadow-goose.com',
      role: 'admin',
      name: 'Test User',
    };

    const mockResponse: AuthResponse = {
      access_token: 'mock_token_' + Date.now(),
      token_type: 'Bearer',
      user: mockUser,
    };

    // Store token and user data
    localStorage.setItem(this.tokenKey, mockResponse.access_token);
    localStorage.setItem(this.userKey, JSON.stringify(mockResponse.user));

    return mockResponse;
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // For development, use mock login if API is not available
      if (!process.env.NEXT_PUBLIC_API_URL) {
        return this.mockLogin(credentials);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: AuthResponse = await response.json();

      // Store token and user data
      localStorage.setItem(this.tokenKey, data.access_token);
      localStorage.setItem(this.userKey, JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to mock login for development
      return this.mockLogin(credentials);
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Get current user
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
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

  // Make authenticated API request
  async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();

    if (!token) {
      throw new Error('No authentication token');
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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
}

export const authService = new AuthService();

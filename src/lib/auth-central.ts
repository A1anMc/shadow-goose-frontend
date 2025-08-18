// CENTRALIZED AUTHENTICATION SERVICE
// Single source of truth for all authentication across the entire application
// This prevents authentication inconsistencies and makes the system secure and maintainable

import { configService } from './config';

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

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  tokenExpiry: number | null;
}

class CentralAuthService {
  private static instance: CentralAuthService;
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    tokenExpiry: null,
  };

  private constructor() {
    this.initializeFromStorage();
  }

  static getInstance(): CentralAuthService {
    if (!CentralAuthService.instance) {
      CentralAuthService.instance = new CentralAuthService();
    }
    return CentralAuthService.instance;
  }

  // Initialize authentication state from localStorage
  private initializeFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem(configService.getAuthTokenKey());
        const userData = localStorage.getItem(configService.getUserDataKey());
        const expiry = localStorage.getItem(configService.getTokenExpiryKey());

        if (token && userData && expiry) {
          const expiryTime = parseInt(expiry);
          if (Date.now() < expiryTime) {
            // Token is still valid
            this.state = {
              isAuthenticated: true,
              user: JSON.parse(userData),
              token,
              tokenExpiry: expiryTime,
            };
          } else {
            // Token is expired, clear it
            this.clearAuth();
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth from storage:', error);
      this.clearAuth();
    }
  }

  // Login user with centralized error handling
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${configService.getApiUrl()}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        signal: AbortSignal.timeout(configService.getApiTimeout()),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Login failed: ${response.status}`);
      }

      const data: AuthResponse = await response.json();
      
      // Store authentication data
      this.setAuth(data.access_token, data.user);
      
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Auto-login for development/testing
  async autoLogin(): Promise<boolean> {
    if (!configService.isAutoLoginEnabled()) {
      return false;
    }

    try {
      const response = await this.login({
        username: 'test',
        password: 'test',
      });

      return !!response.access_token;
    } catch (error) {
      console.error('Auto-login failed:', error);
      return false;
    }
  }

  // Logout user
  logout(): void {
    this.clearAuth();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.state.isAuthenticated && this.hasValidToken();
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.state.user;
  }

  // Get authentication token
  getToken(): string | null {
    if (this.hasValidToken()) {
      return this.state.token;
    }
    return null;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    return this.state.user?.role === role;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Make authenticated API request
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
      signal: AbortSignal.timeout(configService.getApiTimeout()),
    });

    // If we get a 401 (Unauthorized), the token might be expired
    if (response.status === 401) {
      console.log('Token expired, logging out user');
      this.logout();
      throw new Error('Authentication token expired. Please login again.');
    }

    return response;
  }

  // Validate token with server
  async validateToken(): Promise<boolean> {
    try {
      const response = await this.authenticatedRequest(`${configService.getApiUrl()}/auth/user`);
      return response.ok;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  // Refresh user data
  async refreshUserData(): Promise<User | null> {
    try {
      const response = await this.authenticatedRequest(`${configService.getApiUrl()}/auth/user`);
      
      if (response.ok) {
        const userData = await response.json();
        this.state.user = userData;
        this.saveUserToStorage(userData);
        return userData;
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
    
    return null;
  }

  // Private methods for managing auth state

  private setAuth(token: string, user: User): void {
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    this.state = {
      isAuthenticated: true,
      user,
      token,
      tokenExpiry: expiryTime,
    };

    this.saveToStorage(token, user, expiryTime);
  }

  private clearAuth(): void {
    this.state = {
      isAuthenticated: false,
      user: null,
      token: null,
      tokenExpiry: null,
    };

    this.clearFromStorage();
  }

  private hasValidToken(): boolean {
    return !!(this.state.token && this.state.tokenExpiry && Date.now() < this.state.tokenExpiry);
  }

  private saveToStorage(token: string, user: User, expiry: number): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(configService.getAuthTokenKey(), token);
        localStorage.setItem(configService.getUserDataKey(), JSON.stringify(user));
        localStorage.setItem(configService.getTokenExpiryKey(), expiry.toString());
      }
    } catch (error) {
      console.error('Failed to save auth to storage:', error);
    }
  }

  private saveUserToStorage(user: User): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(configService.getUserDataKey(), JSON.stringify(user));
      }
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  }

  private clearFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(configService.getAuthTokenKey());
        localStorage.removeItem(configService.getUserDataKey());
        localStorage.removeItem(configService.getTokenExpiryKey());
      }
    } catch (error) {
      console.error('Failed to clear auth from storage:', error);
    }
  }

  // Get current auth state (for debugging/monitoring)
  getAuthState(): AuthState {
    return { ...this.state };
  }
}

// Export singleton instance
export const centralAuthService = CentralAuthService.getInstance();

// Export convenience functions for common use cases
export const isAuthenticated = () => centralAuthService.isAuthenticated();
export const getCurrentUser = () => centralAuthService.getCurrentUser();
export const getToken = () => centralAuthService.getToken();
export const isAdmin = () => centralAuthService.isAdmin();
export const logout = () => centralAuthService.logout();

// CENTRALIZED CONFIGURATION SERVICE
// Single source of truth for all application configuration
// This prevents configuration inconsistencies and makes the system maintainable

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  auth: {
    tokenKey: string;
    userKey: string;
    expiryKey: string;
    autoLoginEnabled: boolean;
  };
  client: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  features: {
    analytics: boolean;
    realTimeUpdates: boolean;
    caching: boolean;
  };
}

class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): AppConfig {
    return {
      api: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://shadow-goose-api.onrender.com',
        timeout: 10000, // 10 seconds
        retries: 3,
      },
      auth: {
        tokenKey: 'sge_auth_token',
        userKey: 'sge_user_data',
        expiryKey: 'sge_token_expiry',
        autoLoginEnabled: true,
      },
      client: {
        name: process.env.NEXT_PUBLIC_CLIENT || 'sge',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
        environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
      },
      features: {
        analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
        realTimeUpdates: true,
        caching: true,
      },
    };
  }

  // API Configuration
  getApiUrl(): string {
    return this.config.api.baseUrl;
  }

  getApiTimeout(): number {
    return this.config.api.timeout;
  }

  getApiRetries(): number {
    return this.config.api.retries;
  }

  // Authentication Configuration
  getAuthTokenKey(): string {
    return this.config.auth.tokenKey;
  }

  getUserDataKey(): string {
    return this.config.auth.userKey;
  }

  getTokenExpiryKey(): string {
    return this.config.auth.expiryKey;
  }

  isAutoLoginEnabled(): boolean {
    return this.config.auth.autoLoginEnabled;
  }

  // Client Configuration
  getClientName(): string {
    return this.config.client.name;
  }

  getClientVersion(): string {
    return this.config.client.version;
  }

  getEnvironment(): string {
    return this.config.client.environment;
  }

  isProduction(): boolean {
    return this.config.client.environment === 'production';
  }

  isDevelopment(): boolean {
    return this.config.client.environment === 'development';
  }

  // Feature Flags
  isAnalyticsEnabled(): boolean {
    return this.config.features.analytics;
  }

  isRealTimeUpdatesEnabled(): boolean {
    return this.config.features.realTimeUpdates;
  }

  isCachingEnabled(): boolean {
    return this.config.features.caching;
  }

  // Validation
  validate(): void {
    const errors: string[] = [];

    if (!this.config.api.baseUrl) {
      errors.push('API base URL is not configured');
    }

    if (!this.config.client.name) {
      errors.push('Client name is not configured');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }

  // Reload configuration (useful for testing)
  reload(): void {
    this.config = this.loadConfig();
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance();

// Export convenience functions for common use cases
export const getApiUrl = () => configService.getApiUrl();
export const getClientName = () => configService.getClientName();
export const isProduction = () => configService.isProduction();
export const isDevelopment = () => configService.isDevelopment();

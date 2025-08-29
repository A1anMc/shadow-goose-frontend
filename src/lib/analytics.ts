export interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'stream' | 'webhook';
  url?: string;
  refreshInterval: number;
  lastSync: string;
  status: 'active' | 'inactive' | 'error';
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'linear' | 'regression' | 'time-series';
  targetMetric: string;
  accuracy: number;
  lastTrained: string;
  status: 'training' | 'ready' | 'error';
}

export interface RealTimeMetric {
  active_users: number;
  page_views: number;
  conversion_rate: number;
  average_session_duration: number;
}

// TODO: Add interfaces for missing methods
export interface PerformanceMetrics {
  load_time: number;
  bundle_size: number;
  first_contentful_paint: number;
  largest_contentful_paint: number;
}

export interface UserBehavior {
  top_pages: string[];
  user_journey: string[];
  drop_off_points: string[];
}

export interface EventData {
  event_name: string;
  user_id: string;
  properties: Record<string, any>;
}

export interface ConversionFunnel {
  stages: string[];
  conversion_rates: number[];
  drop_offs: number[];
}

export interface CustomReport {
  id: string;
  name: string;
  data: Record<string, any>;
}

export interface ReportConfig {
  type: string;
  date_range: { start: string; end: string };
  metrics: string[];
}

export interface GeneratedReport {
  id: string;
  generated_at: string;
  data: Record<string, any>;
}

import { logger } from './logger';

class PredictiveAnalyticsService {
  private get baseUrl() {
    return process.env.NEXT_PUBLIC_API_URL || '';
  }

  async getDataSources(): Promise<DataSource[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/data-sources`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });
      const data = await response.json();
      return data.sources || [];
    } catch (error) {
      console.error('Error fetching data sources:', error);
      return [];
    }
  }

  async getPredictiveModels(): Promise<PredictiveModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/models`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      logger.error('Error fetching predictive models', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  async getRealTimeMetrics(): Promise<RealTimeMetric> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/real-time`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch real-time metrics');
      }
      
      const data = await response.json();
      return data.data || {
        active_users: 0,
        page_views: 0,
        conversion_rate: 0,
        average_session_duration: 0,
      };
    } catch (error) {
      logger.error('Error fetching real-time metrics', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  // TODO: Implement getPerformanceMetrics
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/performance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });
      const data = await response.json();
      return data.data || {
        load_time: 0,
        bundle_size: 0,
        first_contentful_paint: 0,
        largest_contentful_paint: 0,
      };
    } catch (error) {
      logger.error('Error fetching performance metrics', { error: error instanceof Error ? error.message : String(error) });
      return {
        load_time: 0,
        bundle_size: 0,
        first_contentful_paint: 0,
        largest_contentful_paint: 0,
      };
    }
  }

  // TODO: Implement getUserBehavior
  async getUserBehavior(): Promise<UserBehavior> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/user-behavior`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });
      const data = await response.json();
      return data.data || {
        top_pages: [],
        user_journey: [],
        drop_off_points: [],
      };
    } catch (error) {
      logger.error('Error fetching user behavior', { error: error instanceof Error ? error.message : String(error) });
      return {
        top_pages: [],
        user_journey: [],
        drop_off_points: [],
      };
    }
  }

  // TODO: Implement trackEvent
  async trackEvent(eventData: EventData): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
        body: JSON.stringify(eventData),
      });
      const data = await response.json();
      return { success: data.success || false };
    } catch (error) {
      logger.error('Error tracking event', { error: error instanceof Error ? error.message : String(error) });
      return { success: false };
    }
  }

  // TODO: Implement getConversionFunnel
  async getConversionFunnel(): Promise<ConversionFunnel> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/conversion-funnel`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });
      const data = await response.json();
      return data.data || {
        stages: [],
        conversion_rates: [],
        drop_offs: [],
      };
    } catch (error) {
      logger.error('Error fetching conversion funnel', { error: error instanceof Error ? error.message : String(error) });
      return {
        stages: [],
        conversion_rates: [],
        drop_offs: [],
      };
    }
  }

  // TODO: Implement getCustomReports
  async getCustomReports(): Promise<CustomReport[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/custom-reports`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      logger.error('Error fetching custom reports', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  // TODO: Implement generateReport
  async generateReport(reportConfig: ReportConfig): Promise<GeneratedReport> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
        body: JSON.stringify(reportConfig),
      });
      const data = await response.json();
      return data.data || {
        id: '',
        generated_at: new Date().toISOString(),
        data: {},
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        id: '',
        generated_at: new Date().toISOString(),
        data: {},
      };
    }
  }
}

export const analyticsService = new PredictiveAnalyticsService();

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
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  lastUpdated: string;
}

class PredictiveAnalyticsService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

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
      console.error('Error fetching predictive models:', error);
      return [];
    }
  }

  async getRealTimeMetrics(): Promise<RealTimeMetric[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/metrics/realtime`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });
      const data = await response.json();
      return data.metrics || [];
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      return [];
    }
  }
}

export const analyticsService = new PredictiveAnalyticsService();

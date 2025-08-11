import { DataSource, PredictiveModel, RealTimeMetric } from './analytics';

// Mock data for analytics testing
export const mockDataSources: DataSource[] = [
  {
    id: '1',
    name: 'SGE Project Database',
    type: 'database',
    refreshInterval: 15,
    lastSync: new Date().toISOString(),
    status: 'active',
  },
  {
    id: '2',
    name: 'Participant Survey API',
    type: 'api',
    url: 'https://api.sge.org/surveys',
    refreshInterval: 30,
    lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: '3',
    name: 'Funding Tracker',
    type: 'webhook',
    refreshInterval: 60,
    lastSync: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: '4',
    name: 'External Impact Data',
    type: 'file',
    refreshInterval: 120,
    lastSync: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    status: 'inactive',
  },
];

export const mockPredictiveModels: PredictiveModel[] = [
  {
    id: '1',
    name: 'Participant Success Predictor',
    type: 'regression',
    targetMetric: 'completion_rate',
    accuracy: 87,
    lastTrained: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'ready',
  },
  {
    id: '2',
    name: 'Funding Impact Model',
    type: 'linear',
    targetMetric: 'funding_efficiency',
    accuracy: 92,
    lastTrained: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'ready',
  },
  {
    id: '3',
    name: 'Community Engagement Forecast',
    type: 'time-series',
    targetMetric: 'engagement_score',
    accuracy: 78,
    lastTrained: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'training',
  },
  {
    id: '4',
    name: 'Outcome Achievement Predictor',
    type: 'regression',
    targetMetric: 'outcome_success_rate',
    accuracy: 85,
    lastTrained: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    status: 'ready',
  },
];

export const mockRealTimeMetrics: RealTimeMetric[] = [
  {
    id: '1',
    name: 'Active Participants',
    value: 1247,
    unit: 'people',
    trend: 'up',
    changePercent: 12.5,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Project Completion Rate',
    value: 78.3,
    unit: '%',
    trend: 'up',
    changePercent: 3.2,
    lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Average Funding Per Project',
    value: 45000,
    unit: 'AUD',
    trend: 'stable',
    changePercent: 0.8,
    lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Community Engagement Score',
    value: 8.7,
    unit: '/10',
    trend: 'up',
    changePercent: 5.4,
    lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    name: 'Outcome Achievement Rate',
    value: 82.1,
    unit: '%',
    trend: 'down',
    changePercent: -1.2,
    lastUpdated: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    name: 'Data Quality Score',
    value: 94.5,
    unit: '%',
    trend: 'up',
    changePercent: 2.1,
    lastUpdated: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
];

class MockAnalyticsService {
  async getDataSources(): Promise<DataSource[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDataSources;
  }

  async getPredictiveModels(): Promise<PredictiveModel[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPredictiveModels;
  }

  async getRealTimeMetrics(): Promise<RealTimeMetric[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockRealTimeMetrics;
  }
}

export const mockAnalyticsService = new MockAnalyticsService();

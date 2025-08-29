// Set environment variable before importing the service
process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';

import { analyticsService } from '../analytics';

// Mock fetch
global.fetch = jest.fn();

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRealTimeMetrics', () => {
    it('fetches real-time metrics successfully', async () => {
      const mockMetrics = {
        active_users: 150,
        page_views: 2500,
        conversion_rate: 0.15,
        average_session_duration: 180,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockMetrics }),
      });

      const result = await analyticsService.getRealTimeMetrics();

      expect(result).toEqual(mockMetrics);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/analytics/real-time',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer null',
          }),
        })
      );
    });

    it('handles API errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(analyticsService.getRealTimeMetrics()).rejects.toThrow('API Error');
    });

    it('handles non-OK responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(analyticsService.getRealTimeMetrics()).rejects.toThrow('Failed to fetch real-time metrics');
    });
  });

  describe('getPerformanceMetrics', () => {
    it('fetches performance metrics successfully', async () => {
      const mockPerformance = {
        load_time: 2.5,
        bundle_size: 1500000,
        first_contentful_paint: 1.2,
        largest_contentful_paint: 2.8,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPerformance }),
      });

      const result = await analyticsService.getPerformanceMetrics();

      expect(result).toEqual(mockPerformance);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/analytics/performance',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer null',
          }),
        })
      );
    });
  });

  describe('getUserBehavior', () => {
    it('fetches user behavior data successfully', async () => {
      const mockBehavior = {
        top_pages: ['/dashboard', '/grants', '/analytics'],
        user_journey: ['landing', 'dashboard', 'grants'],
        drop_off_points: ['/application-form'],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockBehavior }),
      });

      const result = await analyticsService.getUserBehavior();

      expect(result).toEqual(mockBehavior);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/analytics/user-behavior',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer null',
          }),
        })
      );
    });
  });

  describe('trackEvent', () => {
    it('tracks events successfully', async () => {
      const eventData = {
        event_name: 'grant_application_started',
        user_id: 'user123',
        properties: { grant_id: 'grant456', amount: 50000 },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await analyticsService.trackEvent(eventData);

      expect(result).toEqual({ success: true });
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/analytics/track',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer null',
          }),
          body: JSON.stringify(eventData),
        })
      );
    });
  });

  describe('getConversionFunnel', () => {
    it('fetches conversion funnel data successfully', async () => {
      const mockFunnel = {
        stages: ['awareness', 'interest', 'application', 'submission'],
        conversion_rates: [100, 75, 50, 25],
        drop_offs: [0, 25, 25, 25],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockFunnel }),
      });

      const result = await analyticsService.getConversionFunnel();

      expect(result).toEqual(mockFunnel);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/analytics/conversion-funnel',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer null',
          }),
        })
      );
    });
  });

  describe('getCustomReports', () => {
    it('fetches custom reports successfully', async () => {
      const mockReports = [
        { id: '1', name: 'Grant Success Report', data: {} },
        { id: '2', name: 'User Engagement Report', data: {} },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockReports }),
      });

      const result = await analyticsService.getCustomReports();

      expect(result).toEqual(mockReports);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/analytics/custom-reports',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer null',
          }),
        })
      );
    });
  });

  describe('generateReport', () => {
    it('generates reports successfully', async () => {
      const reportConfig = {
        type: 'grant_performance',
        date_range: { start: '2025-01-01', end: '2025-12-31' },
        metrics: ['success_rate', 'conversion_rate', 'revenue'],
      };

      const mockReport = {
        id: 'report123',
        generated_at: new Date().toISOString(),
        data: { success_rate: 0.75, conversion_rate: 0.25, revenue: 100000 },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockReport }),
      });

      const result = await analyticsService.generateReport(reportConfig);

      expect(result).toEqual(mockReport);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/analytics/generate-report',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer null',
          }),
          body: JSON.stringify(reportConfig),
        })
      );
    });
  });
});

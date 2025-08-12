import { analyticsService } from '../src/lib/analytics';

describe('analyticsService', () => {
  const realFetch = global.fetch as any;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
  });

  afterEach(() => {
    (global as any).fetch = realFetch;
  });

  it('returns empty arrays on fetch error', async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('net'));
    const models = await analyticsService.getPredictiveModels();
    expect(models).toEqual([]);
  });
});

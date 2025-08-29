import { NextApiRequest, NextApiResponse } from 'next';
import { healthMonitor, defaultHealthChecks } from '../../src/lib/monitoring/health-monitor';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get health status
    const healthStatus = healthMonitor.getHealthStatus();
    
    // Set appropriate status code based on health
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      status: 'unhealthy',
      timestamp: new Date().toISOString()
    });
  }
}

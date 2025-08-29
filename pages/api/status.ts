import { NextApiRequest, NextApiResponse } from 'next';
import { healthMonitor } from '../../src/lib/monitoring/health-monitor';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const healthStatus = healthMonitor.getHealthStatus();
    
    // Enhanced status response
    const statusResponse = {
      ...healthStatus,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        arch: process.arch
      },
      services: {
        database: 'operational', // Placeholder
        api: 'operational', // Placeholder
        external: 'operational' // Placeholder
      },
      performance: {
        ...healthStatus.performance,
        loadAverage: process.cpuUsage ? process.cpuUsage() : null
      }
    };

    res.status(200).json(statusResponse);
  } catch (error) {
    logger.error('Status check error', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ 
      error: 'Internal server error',
      status: 'unhealthy',
      timestamp: new Date().toISOString()
    });
  }
}

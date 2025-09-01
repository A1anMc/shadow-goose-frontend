import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabaseHealth } from '../../src/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get database health status
    const dbHealth = await getDatabaseHealth();
    
    // Create comprehensive health status
    const healthStatus = {
      status: dbHealth.status,
      message: dbHealth.message,
      timestamp: dbHealth.timestamp,
      database: dbHealth,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
    
    // Set appropriate status code based on health
    const statusCode = dbHealth.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);
          } catch {
          // Log error for monitoring purposes
          res.status(500).json({
            error: 'Internal server error',
            status: 'unhealthy',
            timestamp: new Date().toISOString()
          });
        }
}

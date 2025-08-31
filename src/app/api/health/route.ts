import { NextResponse } from 'next/server';
import { getDatabaseHealth } from '../../../lib/database';

export async function GET() {
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
    
    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

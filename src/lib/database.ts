import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Global variable to hold the Prisma client instance
let prisma: PrismaClient;

// Initialize Prisma client
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  // Development: log all queries
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  await prisma.$disconnect();
  process.exit(1);
});

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

// Health check for database
export async function getDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: string;
}> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      message: 'Database connection is working',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export the Prisma client
export { prisma };

// Export commonly used operations
export const db = {
  // User operations
  users: prisma.user,
  
  // Grant operations
  grants: prisma.grant,
  grantApplications: prisma.grantApplication,
  
  // Project operations
  projects: prisma.project,
  projectMappings: prisma.projectMapping,
  
  // Impact operations
  impactMeasurements: prisma.impactMeasurement,
  impactStories: prisma.impactStory,
  sdgMappings: prisma.sDGMapping,
  
  // Notification operations
  notifications: prisma.notification,
  
  // OKR operations
  okrs: prisma.oKR,
  
  // Relationship operations
  relationships: prisma.relationship,
  
  // Document operations
  documents: prisma.document,
  
  // Raw query operations
  $queryRaw: prisma.$queryRaw,
  $executeRaw: prisma.$executeRaw,
  
  // Transaction operations
  $transaction: prisma.$transaction,
};

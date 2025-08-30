import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from './logger';

// CORS configuration
export interface CorsConfig {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  allowCredentials?: boolean;
  maxAge?: number;
}

// Default CORS configuration
const defaultConfig: CorsConfig = {
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowCredentials: true,
  maxAge: 86400, // 24 hours
};

// Apply CORS headers to response
export function applyCorsHeaders(req: NextApiRequest, res: NextApiResponse, config: CorsConfig = {}) {
  const corsConfig = { ...defaultConfig, ...config };
  const origin = req.headers.origin;

  // Set CORS headers
  if (corsConfig.allowedOrigins?.includes('*') || (origin && corsConfig.allowedOrigins?.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  if (corsConfig.allowedMethods) {
    res.setHeader('Access-Control-Allow-Methods', corsConfig.allowedMethods.join(', '));
  }

  if (corsConfig.allowedHeaders) {
    res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  }

  if (corsConfig.allowCredentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (corsConfig.maxAge) {
    res.setHeader('Access-Control-Max-Age', corsConfig.maxAge.toString());
  }

  // Log CORS request for security monitoring
  logger.info('CORS headers applied', {
    origin,
    method: req.method,
    path: req.url,
    userAgent: req.headers['user-agent']
  });
}

// Handle CORS preflight requests
export function handleCorsPreflight(req: NextApiRequest, res: NextApiResponse, config: CorsConfig = {}) {
  if (req.method === 'OPTIONS') {
    applyCorsHeaders(req, res, config);
    
    logger.info('CORS preflight request handled', {
      origin: req.headers.origin,
      method: req.method,
      headers: req.headers['access-control-request-headers']
    });
    
    res.status(200).end();
    return true; // Indicates preflight was handled
  }
  
  return false; // Indicates preflight was not handled
}

// Higher-order function to wrap API handlers with CORS
export function withCORS(handler: Function, config: CorsConfig = {}) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Handle preflight requests
    if (handleCorsPreflight(req, res, config)) {
      return;
    }

    // Apply CORS headers for actual requests
    applyCorsHeaders(req, res, config);
    
    // Call the original handler
    return handler(req, res);
  };
}

// CORS middleware for use in API routes
export function corsMiddleware(config: CorsConfig = {}) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    // Handle preflight requests
    if (handleCorsPreflight(req, res, config)) {
      return;
    }

    // Apply CORS headers for actual requests
    applyCorsHeaders(req, res, config);
  };
}

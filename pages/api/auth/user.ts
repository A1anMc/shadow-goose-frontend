import { NextApiRequest, NextApiResponse } from 'next';
import { authService } from '../../../src/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // For demo purposes, validate the token format and return mock user data
    if (token.startsWith('demo-token-')) {
      const mockUser = {
        id: 1,
        username: 'test',
        email: 'test@sge.com',
        role: 'admin',
        name: 'Test User'
      };

      return res.status(200).json(mockUser);
    }

    // Try to validate with auth service
    try {
      const isValid = await authService.validateToken();
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const user = authService.getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    } catch {
      return res.status(401).json({ error: 'Authentication failed' });
    }
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

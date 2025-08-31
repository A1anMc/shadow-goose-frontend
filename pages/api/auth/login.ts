import { NextApiRequest, NextApiResponse } from 'next';
import { authService } from '../../../src/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // For demo purposes, accept test credentials
    if (username === 'test' && password === 'test') {
      const mockToken = 'demo-token-' + Date.now();
      const mockUser = {
        id: 1,
        username: 'test',
        email: 'test@sge.com',
        role: 'admin',
        name: 'Test User'
      };

      return res.status(200).json({
        access_token: mockToken,
        user: mockUser,
        message: 'Login successful'
      });
    }

    // Try real authentication
    try {
      const response = await authService.login({ username, password });
      return res.status(200).json(response);
    } catch (authError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

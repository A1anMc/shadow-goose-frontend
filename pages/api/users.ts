import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shadow-goose-api-staging.onrender.com';
    
    // First verify the token and check if user is admin
    const userResponse = await fetch(`${apiUrl}/auth/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userData = await userResponse.json();
    
    if (userData.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // For now, return mock users since we're using in-memory storage
    const mockUsers = [
      {
        id: 1,
        username: 'test',
        email: 'test@shadow-goose.com',
        role: 'admin',
        created_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        username: 'kiara',
        email: 'kiara@shadow-goose.com',
        role: 'manager',
        created_at: '2025-01-16T11:00:00Z'
      },
      {
        id: 3,
        username: 'stephen',
        email: 'stephen@shadow-goose.com',
        role: 'user',
        created_at: '2025-01-17T12:00:00Z'
      }
    ];

    res.status(200).json({ users: mockUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
} 
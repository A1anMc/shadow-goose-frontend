import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { time_range = '24h' } = req.query;
      
      // Mock Instant Analytics data (replace with actual API integration)
      const mockData = {
        active_users: Math.floor(Math.random() * 1000) + 100,
        page_views: Math.floor(Math.random() * 5000) + 500,
        sessions: Math.floor(Math.random() * 2000) + 200,
        bounce_rate: Math.random() * 0.5 + 0.2, // 20-70%
        avg_session_duration: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
        
        user_engagement_score: Math.random() * 0.4 + 0.6, // 60-100%
        feature_adoption_rate: Math.random() * 0.3 + 0.4, // 40-70%
        user_satisfaction_score: Math.random() * 0.3 + 0.7, // 70-100%
        
        page_load_time: Math.random() * 2 + 1, // 1-3 seconds
        api_response_time: Math.random() * 500 + 100, // 100-600ms
        error_rate: Math.random() * 0.05, // 0-5%
        
        conversion_rate: Math.random() * 0.1 + 0.02, // 2-12%
        revenue_generated: Math.floor(Math.random() * 50000) + 5000,
        user_acquisition_cost: Math.random() * 50 + 10, // $10-60
        
        custom_events: {
          'grant_application_started': {
            count: Math.floor(Math.random() * 100) + 20,
            unique_users: Math.floor(Math.random() * 80) + 15,
            conversion_value: Math.floor(Math.random() * 10000) + 2000
          },
          'impact_measurement_completed': {
            count: Math.floor(Math.random() * 50) + 10,
            unique_users: Math.floor(Math.random() * 40) + 8,
            conversion_value: Math.floor(Math.random() * 5000) + 1000
          },
          'okr_created': {
            count: Math.floor(Math.random() * 30) + 5,
            unique_users: Math.floor(Math.random() * 25) + 4,
            conversion_value: Math.floor(Math.random() * 3000) + 500
          }
        },
        
        timestamp: new Date().toISOString()
      };

      res.status(200).json({ data: mockData });
    } catch (error) {
      console.error('Error fetching Instant Analytics data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { event_name, event_data, timestamp } = req.body;

      if (!event_name) {
        return res.status(400).json({ error: 'Event name is required' });
      }

      // Store custom event in database
      const query = `
        INSERT INTO analytics_events (
          event_name, event_data, timestamp, source
        ) VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const result = await pool.query(query, [
        event_name,
        JSON.stringify(event_data || {}),
        timestamp || new Date().toISOString(),
        'instant_analytics'
      ]);

      res.status(201).json({ data: result.rows[0] });
    } catch (error) {
      console.error('Error tracking Instant Analytics event:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { logger } from '../../lib/logger';

const _pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { start_date, end_date, _metrics } = req.body;
      
      // Mock Google Analytics data (replace with actual API integration)
      const mockData = {
        organic_search: Math.floor(Math.random() * 1000) + 200,
        direct_traffic: Math.floor(Math.random() * 800) + 150,
        social_media: Math.floor(Math.random() * 500) + 100,
        email_marketing: Math.floor(Math.random() * 300) + 50,
        paid_search: Math.floor(Math.random() * 400) + 75,
        referrals: Math.floor(Math.random() * 200) + 25,
        
        age_groups: {
          '18-24': Math.floor(Math.random() * 100) + 20,
          '25-34': Math.floor(Math.random() * 200) + 50,
          '35-44': Math.floor(Math.random() * 150) + 40,
          '45-54': Math.floor(Math.random() * 100) + 30,
          '55+': Math.floor(Math.random() * 80) + 20,
        },
        
        gender_distribution: {
          'Male': Math.floor(Math.random() * 300) + 100,
          'Female': Math.floor(Math.random() * 350) + 120,
          'Other': Math.floor(Math.random() * 50) + 10,
        },
        
        geographic_locations: {
          'Victoria': Math.floor(Math.random() * 400) + 150,
          'New South Wales': Math.floor(Math.random() * 300) + 100,
          'Queensland': Math.floor(Math.random() * 200) + 75,
          'Western Australia': Math.floor(Math.random() * 150) + 50,
          'Other': Math.floor(Math.random() * 100) + 25,
        },
        
        device_types: {
          'Desktop': Math.floor(Math.random() * 400) + 150,
          'Mobile': Math.floor(Math.random() * 500) + 200,
          'Tablet': Math.floor(Math.random() * 100) + 30,
        },
        
        top_pages: [
          {
            page_path: '/dashboard',
            page_views: Math.floor(Math.random() * 1000) + 500,
            unique_page_views: Math.floor(Math.random() * 800) + 400,
            avg_time_on_page: Math.floor(Math.random() * 300) + 120,
            bounce_rate: Math.random() * 0.4 + 0.2,
          },
          {
            page_path: '/grants',
            page_views: Math.floor(Math.random() * 800) + 300,
            unique_page_views: Math.floor(Math.random() * 600) + 250,
            avg_time_on_page: Math.floor(Math.random() * 400) + 180,
            bounce_rate: Math.random() * 0.3 + 0.15,
          },
          {
            page_path: '/impact-analytics',
            page_views: Math.floor(Math.random() * 600) + 200,
            unique_page_views: Math.floor(Math.random() * 450) + 150,
            avg_time_on_page: Math.floor(Math.random() * 500) + 240,
            bounce_rate: Math.random() * 0.25 + 0.1,
          },
        ],
        
        ecommerce_metrics: {
          transactions: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 25000) + 5000,
          average_order_value: Math.floor(Math.random() * 500) + 200,
          conversion_rate: Math.random() * 0.05 + 0.02,
        },
        
        goal_completions: {
          'grant_application_started': Math.floor(Math.random() * 100) + 20,
          'impact_measurement_completed': Math.floor(Math.random() * 50) + 10,
          'okr_created': Math.floor(Math.random() * 30) + 5,
          'relationship_event_logged': Math.floor(Math.random() * 80) + 15,
        },
        
        conversion_funnels: [
          {
            stage: 'Landing Page',
            users: Math.floor(Math.random() * 1000) + 500,
            conversion_rate: Math.random() * 0.8 + 0.6,
          },
          {
            stage: 'Grant Discovery',
            users: Math.floor(Math.random() * 800) + 400,
            conversion_rate: Math.random() * 0.6 + 0.4,
          },
          {
            stage: 'Application Started',
            users: Math.floor(Math.random() * 500) + 200,
            conversion_rate: Math.random() * 0.4 + 0.2,
          },
          {
            stage: 'Application Completed',
            users: Math.floor(Math.random() * 200) + 100,
            conversion_rate: Math.random() * 0.3 + 0.1,
          },
        ],
        
        date_range: {
          start_date: start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: end_date || new Date().toISOString().split('T')[0],
        },
      };

      res.status(200).json({ data: mockData });
    } catch (error) {
      logger.error('Error fetching Google Analytics data', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

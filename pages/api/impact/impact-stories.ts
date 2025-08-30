import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { logger } from '../../lib/logger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { project_id, category } = req.query;
      
      if (!project_id) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      let query = `
        SELECT * FROM impact_stories 
        WHERE project_id = $1
      `;
      const params = [project_id];

      if (category) {
        query += ' AND impact_category = $2';
        params.push(category as string);
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);
      res.status(200).json({ data: result.rows });
    } catch (error) {
      logger.error('Error fetching impact stories', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { 
        project_id, 
        title, 
        description, 
        participant_name,
        participant_type,
        impact_category,
        frameworks,
        media_files,
        permissions
      } = req.body;

      if (!project_id || !title || !description || !participant_type || !impact_category) {
        return res.status(400).json({ 
          error: 'Project ID, title, description, participant type, and impact category are required' 
        });
      }

      const query = `
        INSERT INTO impact_stories (
          project_id, title, description, participant_name, participant_type,
          impact_category, frameworks, media_files, permissions
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const result = await pool.query(query, [
        project_id,
        title,
        description,
        participant_name || null,
        participant_type,
        impact_category,
        frameworks || [],
        media_files || [],
        permissions || {}
      ]);

      res.status(201).json({ data: result.rows[0] });
    } catch (error) {
      logger.error('Error creating impact story', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const updates = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Story ID is required' });
      }

      const allowedFields = [
        'title', 'description', 'participant_name', 'participant_type',
        'impact_category', 'frameworks', 'media_files', 'permissions'
      ];
      const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
      
      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const query = `
        UPDATE impact_stories 
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const values = [id, ...updateFields.map(field => updates[field])];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Impact story not found' });
      }

      res.status(200).json({ data: result.rows[0] });
    } catch (error) {
      logger.error('Error updating impact story', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Story ID is required' });
      }

      const query = 'DELETE FROM impact_stories WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Impact story not found' });
      }

      res.status(200).json({ data: result.rows[0] });
    } catch (error) {
      logger.error('Error deleting impact story', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

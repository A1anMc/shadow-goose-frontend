import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { logger } from '../../lib/logger';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { project_id } = req.query;
      
      if (!project_id) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      const query = `
        SELECT 
          pim.*,
          COALESCE(sdg_count.count, 0) as sdg_mappings_count,
          COALESCE(victorian_count.count, 0) as victorian_mappings_count,
          COALESCE(cemp_count.count, 0) as cemp_mappings_count
        FROM project_impact_mappings pim
        LEFT JOIN (
          SELECT project_id, COUNT(*) as count 
          FROM project_sdg_mappings 
          WHERE project_id = $1 
          GROUP BY project_id
        ) sdg_count ON pim.project_id = sdg_count.project_id
        LEFT JOIN (
          SELECT project_id, COUNT(*) as count 
          FROM project_victorian_mappings 
          WHERE project_id = $1 
          GROUP BY project_id
        ) victorian_count ON pim.project_id = victorian_count.project_id
        LEFT JOIN (
          SELECT project_id, COUNT(*) as count 
          FROM project_cemp_mappings 
          WHERE project_id = $1 
          GROUP BY project_id
        ) cemp_count ON pim.project_id = cemp_count.project_id
        WHERE pim.project_id = $1
      `;

      const result = await pool.query(query, [project_id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project mapping not found' });
      }

      res.status(200).json({ data: result.rows[0] });
    } catch (error) {
      logger.error('Error fetching project mapping', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { project_id, attribution_percentage, evidence_quality } = req.body;

      if (!project_id) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      const query = `
        INSERT INTO project_impact_mappings (project_id, attribution_percentage, evidence_quality)
        VALUES ($1, $2, $3)
        ON CONFLICT (project_id) 
        DO UPDATE SET 
          attribution_percentage = EXCLUDED.attribution_percentage,
          evidence_quality = EXCLUDED.evidence_quality,
          last_updated = NOW(),
          updated_at = NOW()
        RETURNING *
      `;

      const result = await pool.query(query, [
        project_id,
        attribution_percentage || 0,
        evidence_quality || 'medium'
      ]);

      res.status(201).json({ data: result.rows[0] });
    } catch (error) {
      logger.error('Error creating project mapping', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { project_id } = req.query;
      const updates = req.body;

      if (!project_id) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      const allowedFields = ['attribution_percentage', 'evidence_quality'];
      const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
      
      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const query = `
        UPDATE project_impact_mappings 
        SET ${setClause}, last_updated = NOW(), updated_at = NOW()
        WHERE project_id = $1
        RETURNING *
      `;

      const values = [project_id, ...updateFields.map(field => updates[field])];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project mapping not found' });
      }

      res.status(200).json({ data: result.rows[0] });
    } catch (error) {
      logger.error('Error updating project mapping', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

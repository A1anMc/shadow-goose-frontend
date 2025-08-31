import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../src/lib/database';
import { logger } from '../../../src/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { project_id } = req.query;
      
      if (!project_id) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      const query = `
        SELECT * FROM project_mappings 
        WHERE project_id = ?
      `;

      const stmt = db.prepare(query);
      const result = stmt.all([project_id]);
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Project mapping not found' });
      }

      res.status(200).json({ data: result[0] });
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
        VALUES (?, ?, ?)
        ON CONFLICT (project_id) 
        DO UPDATE SET 
          attribution_percentage = EXCLUDED.attribution_percentage,
          evidence_quality = EXCLUDED.evidence_quality,
          last_updated = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const stmt = db.prepare(query);
      const result = stmt.all([
        project_id,
        attribution_percentage || 0,
        evidence_quality || 'medium'
      ]);

      res.status(201).json({ data: result[0] });
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
        SET ${setClause}, last_updated = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE project_id = ?
        RETURNING *
      `;

      const values = [project_id, ...updateFields.map(field => updates[field])];
      const stmt = db.prepare(query);
      const result = stmt.get(values);

      if (result.length === 0) {
        return res.status(404).json({ error: 'Project mapping not found' });
      }

      res.status(200).json({ data: result[0] });
    } catch (error) {
      logger.error('Error updating project mapping', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

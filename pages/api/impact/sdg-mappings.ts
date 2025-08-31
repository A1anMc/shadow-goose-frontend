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
        SELECT 
          psdm.*,
          sg.code as sdg_goal_code,
          sg.title as sdg_goal_title,
          sg.description as sdg_goal_description,
          sg.color as sdg_goal_color,
          sg.icon as sdg_goal_icon,
          st.code as sdg_target_code,
          st.description as sdg_target_description,
          si.code as sdg_indicator_code,
          si.description as sdg_indicator_description,
          si.unit as sdg_indicator_unit,
          si.measurement_type as sdg_indicator_measurement_type
        FROM project_sdg_mappings psdm
        JOIN sdg_goals sg ON psdm.sdg_goal_id = sg.id
        JOIN sdg_targets st ON psdm.sdg_target_id = st.id
        JOIN sdg_indicators si ON psdm.sdg_indicator_id = si.id
        WHERE psdm.project_id = ?
        ORDER BY sg.id, st.code, si.code
      `;

      const stmt = db.prepare(query);
      const result = stmt.all([project_id]);
      res.status(200).json({ data: result });
    } catch (error) {
      logger.error('Error fetching SDG mappings', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { 
        project_id, 
        sdg_goal_id, 
        sdg_target_id, 
        sdg_indicator_id,
        current_value,
        target_value,
        contribution_percentage,
        evidence
      } = req.body;

      if (!project_id || !sdg_goal_id || !sdg_target_id || !sdg_indicator_id) {
        return res.status(400).json({ 
          error: 'Project ID, SDG Goal ID, Target ID, and Indicator ID are required' 
        });
      }

      const query = `
        INSERT INTO project_sdg_mappings (
          project_id, sdg_goal_id, sdg_target_id, sdg_indicator_id,
          current_value, target_value, contribution_percentage, evidence
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (project_id, sdg_goal_id, sdg_target_id, sdg_indicator_id) 
        DO UPDATE SET 
          current_value = EXCLUDED.current_value,
          target_value = EXCLUDED.target_value,
          contribution_percentage = EXCLUDED.contribution_percentage,
          evidence = EXCLUDED.evidence,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const stmt = db.prepare(query);
      const result = stmt.run([
        project_id,
        sdg_goal_id,
        sdg_target_id,
        sdg_indicator_id,
        current_value || 0,
        target_value || 0,
        contribution_percentage || 0,
        evidence || []
      ]);

      res.status(201).json({ data: result[0] });
    } catch (error) {
      logger.error('Error creating SDG mapping', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const updates = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Mapping ID is required' });
      }

      const allowedFields = ['current_value', 'target_value', 'contribution_percentage', 'evidence'];
      const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
      
      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const query = `
        UPDATE project_sdg_mappings 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING *
      `;

      const values = [id, ...updateFields.map(field => updates[field])];
      const stmt = db.prepare(query);
      const result = stmt.get(values);

      if (result.length === 0) {
        return res.status(404).json({ error: 'SDG mapping not found' });
      }

      res.status(200).json({ data: result[0] });
    } catch (error) {
      logger.error('Error updating SDG mapping', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Mapping ID is required' });
      }

      const query = 'DELETE FROM project_sdg_mappings WHERE id = ? RETURNING *';
      const stmt = db.prepare(query);
      const result = stmt.all([id]);

      if (result.length === 0) {
        return res.status(404).json({ error: 'SDG mapping not found' });
      }

      res.status(200).json({ data: result[0] });
    } catch (error) {
      logger.error('Error deleting SDG mapping', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

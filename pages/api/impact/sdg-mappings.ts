import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

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
        WHERE psdm.project_id = $1
        ORDER BY sg.id, st.code, si.code
      `;

      const result = await pool.query(query, [project_id]);
      res.status(200).json({ data: result.rows });
    } catch (error) {
      console.error('Error fetching SDG mappings:', error);
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (project_id, sdg_goal_id, sdg_target_id, sdg_indicator_id) 
        DO UPDATE SET 
          current_value = EXCLUDED.current_value,
          target_value = EXCLUDED.target_value,
          contribution_percentage = EXCLUDED.contribution_percentage,
          evidence = EXCLUDED.evidence,
          updated_at = NOW()
        RETURNING *
      `;

      const result = await pool.query(query, [
        project_id,
        sdg_goal_id,
        sdg_target_id,
        sdg_indicator_id,
        current_value || 0,
        target_value || 0,
        contribution_percentage || 0,
        evidence || []
      ]);

      res.status(201).json({ data: result.rows[0] });
    } catch (error) {
      console.error('Error creating SDG mapping:', error);
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
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const values = [id, ...updateFields.map(field => updates[field])];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'SDG mapping not found' });
      }

      res.status(200).json({ data: result.rows[0] });
    } catch (error) {
      console.error('Error updating SDG mapping:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Mapping ID is required' });
      }

      const query = 'DELETE FROM project_sdg_mappings WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'SDG mapping not found' });
      }

      res.status(200).json({ data: result.rows[0] });
    } catch (error) {
      console.error('Error deleting SDG mapping:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

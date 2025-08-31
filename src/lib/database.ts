import Database from 'better-sqlite3';
import path from 'path';
import { logger } from './logger';

// Database file path
const dbPath = path.join(process.cwd(), 'database', 'sge.db');

// Initialize database
let db: Database.Database;

try {
  // Ensure database directory exists
  const fs = require('fs');
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Initialize database
  db = new Database(dbPath);
  
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  
  logger.info('SQLite database initialized successfully', { path: dbPath });
} catch (error) {
  logger.error('Failed to initialize SQLite database', { error: error instanceof Error ? error.message : String(error) });
  throw error;
}

// Create tables if they don't exist
const createTables = () => {
  try {
    // Impact Measurements Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS impact_measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT NOT NULL,
        measurement_date TEXT NOT NULL,
        framework TEXT NOT NULL,
        indicator_id TEXT NOT NULL,
        value REAL,
        unit TEXT,
        data_source TEXT,
        methodology TEXT,
        confidence_level TEXT DEFAULT 'medium',
        notes TEXT,
        evidence_files TEXT DEFAULT '[]',
        created_by TEXT DEFAULT 'system',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Impact Stories Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS impact_stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT NOT NULL,
        story_title TEXT NOT NULL,
        story_content TEXT NOT NULL,
        impact_metrics TEXT DEFAULT '{}',
        stakeholder_quotes TEXT DEFAULT '[]',
        media_files TEXT DEFAULT '[]',
        created_by TEXT DEFAULT 'system',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Project Mappings Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS project_mappings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT NOT NULL,
        mapping_type TEXT NOT NULL,
        source_framework TEXT,
        target_framework TEXT,
        mapping_data TEXT DEFAULT '{}',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // SDG Mappings Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS sdg_mappings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sdg_goal TEXT NOT NULL,
        sdg_target TEXT,
        project_id TEXT,
        mapping_strength REAL,
        evidence TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_impact_measurements_project_id ON impact_measurements(project_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_impact_stories_project_id ON impact_stories(project_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_project_mappings_project_id ON project_mappings(project_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_sdg_mappings_project_id ON sdg_mappings(project_id)');

    logger.info('Database tables created successfully');
  } catch (error) {
    logger.error('Failed to create database tables', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

// Insert sample data
const insertSampleData = () => {
  try {
    // Check if data already exists
    const count = db.prepare('SELECT COUNT(*) as count FROM impact_measurements').get() as { count: number };
    
    if (count.count === 0) {
      // Insert sample impact measurements
      db.prepare(`
        INSERT INTO impact_measurements (project_id, measurement_date, framework, indicator_id, value, unit, data_source, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run('proj_001', '2025-08-30', 'SDG', 'SDG_13_1', 150, 'tonnes', 'Carbon tracking system', 'system');

      db.prepare(`
        INSERT INTO impact_measurements (project_id, measurement_date, framework, indicator_id, value, unit, data_source, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run('proj_002', '2025-08-30', 'Victorian', 'VIC_HEALTH_1', 500, 'people', 'Health survey', 'system');

      // Insert sample impact stories
      db.prepare(`
        INSERT INTO impact_stories (project_id, story_title, story_content, created_by)
        VALUES (?, ?, ?, ?)
      `).run('proj_001', 'Climate Action Success', 'Our project successfully reduced carbon emissions by 150 tonnes through innovative renewable energy solutions. Local communities reported improved air quality and reduced energy costs.', 'system');

      db.prepare(`
        INSERT INTO impact_stories (project_id, story_title, story_content, created_by)
        VALUES (?, ?, ?, ?)
      `).run('proj_002', 'Health Impact Story', 'Through our health initiative, we reached 500 people in underserved communities, providing essential healthcare services and education.', 'system');

      // Insert sample project mappings
      db.prepare(`
        INSERT INTO project_mappings (project_id, mapping_type, source_framework, target_framework, mapping_data)
        VALUES (?, ?, ?, ?, ?)
      `).run('proj_001', 'SDG_MAPPING', 'SDG', 'Victorian', '{"sdg_goals": ["13"], "victorian_priorities": ["climate_action"]}');

      db.prepare(`
        INSERT INTO project_mappings (project_id, mapping_type, source_framework, target_framework, mapping_data)
        VALUES (?, ?, ?, ?, ?)
      `).run('proj_002', 'HEALTH_MAPPING', 'Victorian', 'SDG', '{"victorian_priorities": ["health"], "sdg_goals": ["3"]}');

      // Insert sample SDG mappings
      db.prepare(`
        INSERT INTO sdg_mappings (sdg_goal, sdg_target, project_id, mapping_strength, evidence)
        VALUES (?, ?, ?, ?, ?)
      `).run('13', '13.1', 'proj_001', 0.85, 'Direct correlation with climate action metrics');

      db.prepare(`
        INSERT INTO sdg_mappings (sdg_goal, sdg_target, project_id, mapping_strength, evidence)
        VALUES (?, ?, ?, ?, ?)
      `).run('3', '3.8', 'proj_002', 0.78, 'Healthcare access improvement documented');

      logger.info('Sample data inserted successfully');
    }
  } catch (error) {
    logger.error('Failed to insert sample data', { error: error instanceof Error ? error.message : String(error) });
  }
};

// Initialize database
createTables();
insertSampleData();

export { db };

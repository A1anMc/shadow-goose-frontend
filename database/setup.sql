-- SGE Grants System Database Setup
-- This script creates all required tables for the API endpoints

-- Impact Measurements Table
CREATE TABLE IF NOT EXISTS impact_measurements (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    measurement_date DATE NOT NULL,
    framework VARCHAR(100) NOT NULL,
    indicator_id VARCHAR(255) NOT NULL,
    value DECIMAL,
    unit VARCHAR(50),
    data_source VARCHAR(255),
    methodology TEXT,
    confidence_level VARCHAR(50) DEFAULT 'medium',
    notes TEXT,
    evidence_files JSONB DEFAULT '[]',
    created_by VARCHAR(255) DEFAULT 'system',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Impact Stories Table
CREATE TABLE IF NOT EXISTS impact_stories (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    story_title VARCHAR(255) NOT NULL,
    story_content TEXT NOT NULL,
    impact_metrics JSONB DEFAULT '{}',
    stakeholder_quotes JSONB DEFAULT '[]',
    media_files JSONB DEFAULT '[]',
    created_by VARCHAR(255) DEFAULT 'system',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Project Mappings Table
CREATE TABLE IF NOT EXISTS project_mappings (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    mapping_type VARCHAR(100) NOT NULL,
    source_framework VARCHAR(100),
    target_framework VARCHAR(100),
    mapping_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- SDG Mappings Table
CREATE TABLE IF NOT EXISTS sdg_mappings (
    id SERIAL PRIMARY KEY,
    sdg_goal VARCHAR(10) NOT NULL,
    sdg_target VARCHAR(255),
    project_id VARCHAR(255),
    mapping_strength DECIMAL,
    evidence TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_impact_measurements_project_id ON impact_measurements(project_id);
CREATE INDEX IF NOT EXISTS idx_impact_stories_project_id ON impact_stories(project_id);
CREATE INDEX IF NOT EXISTS idx_project_mappings_project_id ON project_mappings(project_id);
CREATE INDEX IF NOT EXISTS idx_sdg_mappings_project_id ON sdg_mappings(project_id);

-- Insert sample data for testing
INSERT INTO impact_measurements (project_id, measurement_date, framework, indicator_id, value, unit, data_source, created_by)
VALUES 
('proj_001', '2025-08-30', 'SDG', 'SDG_13_1', 150, 'tonnes', 'Carbon tracking system', 'system'),
('proj_002', '2025-08-30', 'Victorian', 'VIC_HEALTH_1', 500, 'people', 'Health survey', 'system')
ON CONFLICT DO NOTHING;

INSERT INTO impact_stories (project_id, story_title, story_content, created_by)
VALUES 
('proj_001', 'Climate Action Success', 'Our project successfully reduced carbon emissions by 150 tonnes through innovative renewable energy solutions. Local communities reported improved air quality and reduced energy costs.', 'system'),
('proj_002', 'Health Impact Story', 'Through our health initiative, we reached 500 people in underserved communities, providing essential healthcare services and education.', 'system')
ON CONFLICT DO NOTHING;

INSERT INTO project_mappings (project_id, mapping_type, source_framework, target_framework, mapping_data)
VALUES 
('proj_001', 'SDG_MAPPING', 'SDG', 'Victorian', '{"sdg_goals": ["13"], "victorian_priorities": ["climate_action"]}'),
('proj_002', 'HEALTH_MAPPING', 'Victorian', 'SDG', '{"victorian_priorities": ["health"], "sdg_goals": ["3"]}')
ON CONFLICT DO NOTHING;

INSERT INTO sdg_mappings (sdg_goal, sdg_target, project_id, mapping_strength, evidence)
VALUES 
('13', '13.1', 'proj_001', 0.85, 'Direct correlation with climate action metrics'),
('3', '3.8', 'proj_002', 0.78, 'Healthcare access improvement documented')
ON CONFLICT DO NOTHING;

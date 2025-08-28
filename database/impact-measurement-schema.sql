-- Impact Measurement Database Schema
-- SGE V3 GIIS - Comprehensive Impact Measurement System

-- ============================================================================
-- PROJECT IMPACT MAPPING
-- ============================================================================

-- Project Impact Mapping Table
CREATE TABLE project_impact_mappings (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  attribution_percentage DECIMAL(5,2) DEFAULT 0.00, -- 0-100%
  evidence_quality VARCHAR(20) DEFAULT 'medium', -- 'high', 'medium', 'low'
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_id)
);

-- ============================================================================
-- SDG MAPPINGS
-- ============================================================================

-- SDG Goals Reference Table
CREATE TABLE sdg_goals (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  icon VARCHAR(10), -- Emoji or icon identifier
  created_at TIMESTAMP DEFAULT NOW()
);

-- SDG Targets Reference Table
CREATE TABLE sdg_targets (
  id VARCHAR(20) PRIMARY KEY, -- e.g., "1.1"
  goal_id INTEGER NOT NULL,
  code VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (goal_id) REFERENCES sdg_goals(id) ON DELETE CASCADE
);

-- SDG Indicators Reference Table
CREATE TABLE sdg_indicators (
  id VARCHAR(20) PRIMARY KEY, -- e.g., "1.1.1"
  target_id VARCHAR(20) NOT NULL,
  code VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  unit VARCHAR(50) NOT NULL,
  measurement_type VARCHAR(20) NOT NULL, -- 'quantitative', 'qualitative', 'mixed'
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (target_id) REFERENCES sdg_targets(id) ON DELETE CASCADE
);

-- Project SDG Mappings Table
CREATE TABLE project_sdg_mappings (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  sdg_goal_id INTEGER NOT NULL,
  sdg_target_id VARCHAR(20) NOT NULL,
  sdg_indicator_id VARCHAR(20) NOT NULL,
  current_value DECIMAL(10,2) NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  contribution_percentage DECIMAL(5,2) DEFAULT 0.00, -- 0-100%
  evidence TEXT[], -- Array of evidence file paths
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (sdg_goal_id) REFERENCES sdg_goals(id) ON DELETE CASCADE,
  FOREIGN KEY (sdg_target_id) REFERENCES sdg_targets(id) ON DELETE CASCADE,
  FOREIGN KEY (sdg_indicator_id) REFERENCES sdg_indicators(id) ON DELETE CASCADE
);

-- ============================================================================
-- VICTORIAN GOVERNMENT OUTCOMES
-- ============================================================================

-- Victorian Government Departments Reference Table
CREATE TABLE victorian_departments (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE, -- 'DFFH', 'DJPR', 'CreativeVic', etc.
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Victorian Outcomes Reference Table
CREATE TABLE victorian_outcomes (
  id VARCHAR(50) PRIMARY KEY, -- e.g., "DFFH-1"
  department_id INTEGER NOT NULL,
  code VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (department_id) REFERENCES victorian_departments(id) ON DELETE CASCADE
);

-- Victorian Indicators Reference Table
CREATE TABLE victorian_indicators (
  id VARCHAR(50) PRIMARY KEY, -- e.g., "DFFH-1.1"
  outcome_id VARCHAR(50) NOT NULL,
  code VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  unit VARCHAR(50) NOT NULL,
  target DECIMAL(10,2),
  baseline DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (outcome_id) REFERENCES victorian_outcomes(id) ON DELETE CASCADE
);

-- Project Victorian Mappings Table
CREATE TABLE project_victorian_mappings (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  outcome_id VARCHAR(50) NOT NULL,
  indicator_id VARCHAR(50) NOT NULL,
  current_value DECIMAL(10,2) NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  contribution_percentage DECIMAL(5,2) DEFAULT 0.00, -- 0-100%
  evidence TEXT[], -- Array of evidence file paths
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (outcome_id) REFERENCES victorian_outcomes(id) ON DELETE CASCADE,
  FOREIGN KEY (indicator_id) REFERENCES victorian_indicators(id) ON DELETE CASCADE
);

-- ============================================================================
-- CEMP (COMMUNITY ENGAGEMENT MEASUREMENT PROTOCOL)
-- ============================================================================

-- CEMP Principles Reference Table
CREATE TABLE cemp_principles (
  id VARCHAR(20) PRIMARY KEY, -- e.g., "CEMP-1"
  code VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  weight INTEGER NOT NULL, -- 1-10 scale
  created_at TIMESTAMP DEFAULT NOW()
);

-- CEMP Indicators Reference Table
CREATE TABLE cemp_indicators (
  id VARCHAR(50) PRIMARY KEY, -- e.g., "CEMP-1.1"
  principle_id VARCHAR(20) NOT NULL,
  code VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  measurement_type VARCHAR(20) NOT NULL, -- 'quantitative', 'qualitative', 'mixed'
  unit VARCHAR(50) NOT NULL,
  target DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (principle_id) REFERENCES cemp_principles(id) ON DELETE CASCADE
);

-- Project CEMP Mappings Table
CREATE TABLE project_cemp_mappings (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  principle_id VARCHAR(20) NOT NULL,
  indicator_id VARCHAR(50) NOT NULL,
  current_value DECIMAL(10,2) NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  contribution_percentage DECIMAL(5,2) DEFAULT 0.00, -- 0-100%
  evidence TEXT[], -- Array of evidence file paths
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (principle_id) REFERENCES cemp_principles(id) ON DELETE CASCADE,
  FOREIGN KEY (indicator_id) REFERENCES cemp_indicators(id) ON DELETE CASCADE
);

-- ============================================================================
-- IMPACT MEASUREMENTS
-- ============================================================================

-- Impact Measurements Table
CREATE TABLE impact_measurements (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  measurement_date DATE NOT NULL,
  framework VARCHAR(20) NOT NULL, -- 'SDG', 'Victorian', 'CEMP', 'Custom'
  indicator_id VARCHAR(100) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  data_source VARCHAR(255),
  methodology TEXT,
  confidence_level VARCHAR(20) DEFAULT 'medium', -- 'high', 'medium', 'low'
  notes TEXT,
  evidence_files TEXT[], -- Array of file paths
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- IMPACT STORIES
-- ============================================================================

-- Impact Stories Table
CREATE TABLE impact_stories (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  participant_name VARCHAR(255),
  participant_type VARCHAR(20) NOT NULL, -- 'individual', 'group', 'community'
  impact_category VARCHAR(20) NOT NULL, -- 'social', 'economic', 'environmental', 'cultural'
  frameworks TEXT[], -- Array of framework codes (SDG, Victorian, CEMP)
  media_files TEXT[], -- Array of file paths
  permissions JSONB, -- Photo release, story publication, contact permissions
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- TRIPLE BOTTOM LINE
-- ============================================================================

-- Triple Bottom Line Measurements Table
CREATE TABLE triple_bottom_line (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  measurement_date DATE NOT NULL,
  
  -- Social Impact
  employment_created INTEGER DEFAULT 0,
  skills_developed INTEGER DEFAULT 0,
  community_engagement DECIMAL(5,2) DEFAULT 0.00, -- 0-100%
  social_cohesion DECIMAL(5,2) DEFAULT 0.00, -- 0-100%
  health_improvements DECIMAL(5,2) DEFAULT 0.00, -- 0-100%
  
  -- Economic Impact
  jobs_created INTEGER DEFAULT 0,
  income_generated DECIMAL(12,2) DEFAULT 0.00, -- Currency amount
  local_spending DECIMAL(12,2) DEFAULT 0.00, -- Currency amount
  business_development DECIMAL(5,2) DEFAULT 0.00, -- 0-100%
  economic_multiplier DECIMAL(4,2) DEFAULT 1.00, -- Multiplier factor
  
  -- Environmental Impact
  carbon_reduction DECIMAL(10,2) DEFAULT 0.00, -- CO2 equivalent
  waste_reduction DECIMAL(10,2) DEFAULT 0.00, -- Weight/volume
  energy_efficiency DECIMAL(5,2) DEFAULT 0.00, -- 0-100%
  biodiversity_improvement DECIMAL(5,2) DEFAULT 0.00, -- 0-100%
  sustainable_practices DECIMAL(5,2) DEFAULT 0.00, -- 0-100%
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_id, measurement_date)
);

-- ============================================================================
-- IMPACT REPORTS
-- ============================================================================

-- Impact Reports Table
CREATE TABLE impact_reports (
  id SERIAL PRIMARY KEY,
  report_id VARCHAR(255) NOT NULL UNIQUE, -- Generated ID like "report_PROJECT_1234567890"
  project_id VARCHAR(255) NOT NULL,
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  
  -- Framework Summaries (JSON)
  sdg_summary JSONB,
  victorian_summary JSONB,
  cemp_summary JSONB,
  triple_bottom_line JSONB,
  
  -- Report Metadata
  recommendations TEXT[],
  generated_at TIMESTAMP DEFAULT NOW(),
  generated_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Project mappings indexes
CREATE INDEX idx_project_impact_mappings_project_id ON project_impact_mappings(project_id);
CREATE INDEX idx_project_sdg_mappings_project_id ON project_sdg_mappings(project_id);
CREATE INDEX idx_project_victorian_mappings_project_id ON project_victorian_mappings(project_id);
CREATE INDEX idx_project_cemp_mappings_project_id ON project_cemp_mappings(project_id);

-- Impact measurements indexes
CREATE INDEX idx_impact_measurements_project_id ON impact_measurements(project_id);
CREATE INDEX idx_impact_measurements_framework ON impact_measurements(framework);
CREATE INDEX idx_impact_measurements_date ON impact_measurements(measurement_date);

-- Impact stories indexes
CREATE INDEX idx_impact_stories_project_id ON impact_stories(project_id);
CREATE INDEX idx_impact_stories_category ON impact_stories(impact_category);

-- Triple bottom line indexes
CREATE INDEX idx_triple_bottom_line_project_id ON triple_bottom_line(project_id);
CREATE INDEX idx_triple_bottom_line_date ON triple_bottom_line(measurement_date);

-- Impact reports indexes
CREATE INDEX idx_impact_reports_project_id ON impact_reports(project_id);
CREATE INDEX idx_impact_reports_period ON impact_reports(report_period_start, report_period_end);

-- ============================================================================
-- SAMPLE DATA INSERTION
-- ============================================================================

-- Insert SDG Goals
INSERT INTO sdg_goals (id, code, title, description, color, icon) VALUES
(1, 'SDG1', 'No Poverty', 'End poverty in all its forms everywhere', '#E5243B', '🏠'),
(4, 'SDG4', 'Quality Education', 'Ensure inclusive and equitable quality education', '#C5192D', '🎓'),
(8, 'SDG8', 'Decent Work and Economic Growth', 'Promote sustained, inclusive and sustainable economic growth', '#A21942', '💼'),
(10, 'SDG10', 'Reduced Inequalities', 'Reduce inequality within and among countries', '#DD1367', '⚖️'),
(11, 'SDG11', 'Sustainable Cities and Communities', 'Make cities and human settlements inclusive, safe, resilient and sustainable', '#FD6925', '🏙️'),
(13, 'SDG13', 'Climate Action', 'Take urgent action to combat climate change and its impacts', '#3F7E44', '🌱'),
(16, 'SDG16', 'Peace, Justice and Strong Institutions', 'Promote peaceful and inclusive societies for sustainable development', '#136A9F', '⚖️'),
(17, 'SDG17', 'Partnerships for the Goals', 'Strengthen the means of implementation and revitalize the Global Partnership', '#19486A', '🤝');

-- Insert Victorian Departments
INSERT INTO victorian_departments (code, name, description) VALUES
('DFFH', 'Department of Families, Fairness and Housing', 'Supports families, promotes fairness and provides housing'),
('DJPR', 'Department of Jobs, Precincts and Regions', 'Drives economic growth and job creation'),
('CreativeVic', 'Creative Victoria', 'Supports creative industries and cultural development');

-- Insert CEMP Principles
INSERT INTO cemp_principles (id, code, title, description, weight) VALUES
('CEMP-1', 'CEMP-1', 'Inclusive Participation', 'Ensure diverse and representative community participation', 9),
('CEMP-2', 'CEMP-2', 'Cultural Sensitivity', 'Respect and incorporate cultural values and practices', 8),
('CEMP-3', 'CEMP-3', 'Meaningful Engagement', 'Ensure engagement leads to meaningful outcomes and influence', 10),
('CEMP-4', 'CEMP-4', 'Transparency and Accountability', 'Maintain transparency in process and accountability for outcomes', 7);

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- Project Impact Summary View
CREATE VIEW project_impact_summary AS
SELECT 
  pim.project_id,
  pim.attribution_percentage,
  pim.evidence_quality,
  
  -- SDG Summary
  COUNT(DISTINCT psdm.sdg_goal_id) as sdg_goals_impacted,
  AVG(psdm.contribution_percentage) as avg_sdg_contribution,
  
  -- Victorian Summary
  COUNT(DISTINCT pvm.outcome_id) as victorian_outcomes_impacted,
  AVG(pvm.contribution_percentage) as avg_victorian_contribution,
  
  -- CEMP Summary
  COUNT(DISTINCT pcm.principle_id) as cemp_principles_implemented,
  AVG(pcm.contribution_percentage) as avg_cemp_contribution,
  
  -- Triple Bottom Line
  tbl.employment_created,
  tbl.jobs_created,
  tbl.income_generated,
  tbl.carbon_reduction,
  
  pim.last_updated
FROM project_impact_mappings pim
LEFT JOIN project_sdg_mappings psdm ON pim.project_id = psdm.project_id
LEFT JOIN project_victorian_mappings pvm ON pim.project_id = pvm.project_id
LEFT JOIN project_cemp_mappings pcm ON pim.project_id = pcm.project_id
LEFT JOIN triple_bottom_line tbl ON pim.project_id = tbl.project_id
GROUP BY pim.project_id, pim.attribution_percentage, pim.evidence_quality, 
         tbl.employment_created, tbl.jobs_created, tbl.income_generated, 
         tbl.carbon_reduction, pim.last_updated;

-- ============================================================================
-- TRIGGERS FOR DATA INTEGRITY
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_project_impact_mappings_updated_at 
    BEFORE UPDATE ON project_impact_mappings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_sdg_mappings_updated_at 
    BEFORE UPDATE ON project_sdg_mappings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_victorian_mappings_updated_at 
    BEFORE UPDATE ON project_victorian_mappings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_cemp_mappings_updated_at 
    BEFORE UPDATE ON project_cemp_mappings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impact_measurements_updated_at 
    BEFORE UPDATE ON impact_measurements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impact_stories_updated_at 
    BEFORE UPDATE ON impact_stories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_triple_bottom_line_updated_at 
    BEFORE UPDATE ON triple_bottom_line 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SGE-Specific Database Schema with ML Enhancements
-- Focused on SGE's actual business needs: media projects, cultural representation, social impact

-- Core SGE Grants Table
CREATE TABLE sge_grants (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2),
  deadline DATE,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'open',
  description TEXT,
  eligibility TEXT,
  requirements TEXT,
  application_url TEXT,
  contact_info TEXT,

  -- SGE-Specific Fields
  media_type VARCHAR(100), -- 'documentary', 'digital', 'community', 'multicultural'
  target_audience TEXT[],
  social_impact_areas TEXT[],
  cultural_representation TEXT[],
  diversity_focus BOOLEAN DEFAULT false,

  -- SGE Business Tracking
  sge_status VARCHAR(50) DEFAULT 'discovered', -- 'discovered', 'researching', 'drafting', 'submitted', 'successful', 'unsuccessful'
  team_assigned TEXT[],
  notes TEXT[],

  -- ML Enhancement Fields
  ml_analysis JSONB, -- NLP analysis results
  sge_alignment_score DECIMAL(5,2), -- 0-100 SGE fit score
  success_prediction DECIMAL(5,2), -- 0-100 probability
  confidence_interval JSONB, -- [lower, upper] bounds
  key_factors TEXT[], -- Factors affecting success
  risk_factors TEXT[], -- Risk factors identified
  sge_recommendations TEXT[], -- ML-generated SGE-specific recommendations

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SGE Applications Table
CREATE TABLE sge_applications (
  id SERIAL PRIMARY KEY,
  grant_id INTEGER REFERENCES sge_grants(id),
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'in_progress', 'submitted', 'successful', 'unsuccessful'
  submitted_at TIMESTAMP,

  -- SGE Project Details
  project_title VARCHAR(255),
  project_description TEXT,
  media_type VARCHAR(100),
  target_audience TEXT[],
  social_impact TEXT[],
  cultural_elements TEXT[],
  budget_amount DECIMAL(12,2),

  -- Team Collaboration
  team_members JSONB, -- Array of team member objects
  tasks JSONB, -- Array of task objects
  deadlines JSONB, -- Array of deadline objects

  -- Document Management
  documents JSONB, -- Object with document references

  -- ML Insights
  completion_score DECIMAL(5,2), -- 0-100 completion percentage
  missing_elements TEXT[],
  optimization_suggestions TEXT[],
  sge_impact_prediction JSONB,
  success_probability DECIMAL(5,2),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SGE Document Hub
CREATE TABLE sge_documents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100), -- 'proposal_template', 'budget_template', 'impact_report', 'team_cv', 'supporting_material'
  content TEXT,
  file_path TEXT,
  tags TEXT[],

  -- SGE-Specific Metadata
  sge_category VARCHAR(100), -- 'media', 'cultural', 'social_impact', 'budget', 'team'
  reusable_elements JSONB, -- Extractable content elements
  framework_alignment JSONB, -- UN SDGs, Vic Gov alignment

  -- ML Enhancement
  content_optimization JSONB, -- Optimization results
  impact_enhancement JSONB, -- Impact story enhancements

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SGE Team Members
CREATE TABLE sge_team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100), -- 'creative', 'finance', 'operations', 'leadership'
  email VARCHAR(255),
  skills TEXT[],
  availability JSONB,

  -- SGE-Specific
  media_expertise TEXT[],
  cultural_background TEXT[],
  impact_focus_areas TEXT[],

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SGE ML Models
CREATE TABLE sge_ml_models (
  id SERIAL PRIMARY KEY,
  model_name VARCHAR(100) NOT NULL,
  model_version VARCHAR(50) NOT NULL,
  model_type VARCHAR(50) NOT NULL, -- 'grant_matching', 'success_prediction', 'content_optimization', 'impact_enhancement'
  model_path TEXT,
  accuracy_score DECIMAL(5,2),
  sge_specific_accuracy DECIMAL(5,2), -- Accuracy on SGE-specific data
  last_trained TIMESTAMP,
  is_active BOOLEAN DEFAULT true,

  -- SGE-Specific Model Info
  sge_media_focus BOOLEAN DEFAULT false,
  sge_cultural_focus BOOLEAN DEFAULT false,
  sge_impact_focus BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW()
);

-- SGE ML Predictions
CREATE TABLE sge_ml_predictions (
  id SERIAL PRIMARY KEY,
  model_id INTEGER REFERENCES sge_ml_models(id),
  input_data JSONB,
  prediction_result JSONB,
  confidence_score DECIMAL(5,2),
  sge_relevance_score DECIMAL(5,2), -- How relevant to SGE's needs

  created_at TIMESTAMP DEFAULT NOW()
);

-- SGE Business Metrics
CREATE TABLE sge_business_metrics (
  id SERIAL PRIMARY KEY,
  metric_date DATE NOT NULL,
  total_grants_discovered INTEGER DEFAULT 0,
  applications_submitted INTEGER DEFAULT 0,
  applications_pending INTEGER DEFAULT 0,
  applications_won INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  funding_secured DECIMAL(12,2) DEFAULT 0,
  time_saved_hours DECIMAL(8,2) DEFAULT 0,

  -- SGE-Specific Metrics
  media_projects_funded INTEGER DEFAULT 0,
  cultural_impact_projects INTEGER DEFAULT 0,
  social_impact_projects INTEGER DEFAULT 0,
  team_efficiency_score DECIMAL(5,2) DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_sge_grants_media_type ON sge_grants(media_type);
CREATE INDEX idx_sge_grants_status ON sge_grants(sge_status);
CREATE INDEX idx_sge_grants_deadline ON sge_grants(deadline);
CREATE INDEX idx_sge_applications_status ON sge_applications(status);
CREATE INDEX idx_sge_applications_grant_id ON sge_applications(grant_id);
CREATE INDEX idx_sge_documents_type ON sge_documents(type);
CREATE INDEX idx_sge_team_members_role ON sge_team_members(role);
CREATE INDEX idx_sge_ml_models_type ON sge_ml_models(model_type);
CREATE INDEX idx_sge_business_metrics_date ON sge_business_metrics(metric_date);

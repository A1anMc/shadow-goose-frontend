-- Relationship Impact Tracker Database Schema
-- SGE V3 GIIS - Stakeholder Relationship Management

-- Relationship Events Table
CREATE TABLE relationship_events (
  id SERIAL PRIMARY KEY,
  event_date DATE NOT NULL,
  stakeholder_name VARCHAR(255) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  purpose TEXT NOT NULL,
  key_discussion_points TEXT[],
  follow_up_actions TEXT[],
  contact_details JSONB,
  tags TEXT[],
  
  -- Relationship Health Metrics
  relationship_stage VARCHAR(50) DEFAULT 'initial_contact', -- 'initial_contact', 'active_engagement', 'maintenance', 'partnership'
  health_score INTEGER DEFAULT 50, -- 0-100 scale
  interaction_quality VARCHAR(20) DEFAULT 'neutral', -- 'excellent', 'good', 'neutral', 'poor', 'critical'
  outcome_rating INTEGER DEFAULT 3, -- 1-5 scale
  
  -- CRM Integration
  stakeholder_type VARCHAR(100), -- 'funder', 'partner', 'community', 'government', 'media'
  stakeholder_category VARCHAR(100), -- 'sustainability', 'funding', 'cultural', 'social_impact'
  priority_level VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  
  -- User Management
  created_by INTEGER, -- Reference to users table
  assigned_to INTEGER, -- Reference to users table
  is_public BOOLEAN DEFAULT false, -- Read-only access for team members
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stakeholder Profiles Table
CREATE TABLE stakeholder_profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  organization VARCHAR(255),
  role VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(100),
  address TEXT,
  
  -- Relationship Metrics
  current_stage VARCHAR(50) DEFAULT 'initial_contact',
  health_score INTEGER DEFAULT 50,
  last_interaction_date DATE,
  interaction_frequency VARCHAR(20) DEFAULT 'monthly', -- 'weekly', 'monthly', 'quarterly', 'yearly'
  total_interactions INTEGER DEFAULT 0,
  
  -- Stakeholder Classification
  stakeholder_type VARCHAR(100),
  stakeholder_category VARCHAR(100),
  priority_level VARCHAR(20) DEFAULT 'medium',
  
  -- Impact Tracking
  funding_potential DECIMAL(12,2),
  partnership_value VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  influence_level VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  
  -- Notes and History
  notes TEXT,
  relationship_history JSONB,
  
  -- User Management
  created_by INTEGER,
  assigned_to INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Relationship Timeline Table
CREATE TABLE relationship_timeline (
  id SERIAL PRIMARY KEY,
  stakeholder_id INTEGER REFERENCES stakeholder_profiles(id),
  event_id INTEGER REFERENCES relationship_events(id),
  stage VARCHAR(50) NOT NULL,
  health_score INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Roles for Relationship Management
CREATE TABLE relationship_user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  stakeholder_id INTEGER REFERENCES stakeholder_profiles(id),
  role VARCHAR(50) NOT NULL, -- 'owner', 'editor', 'viewer'
  permissions JSONB, -- Specific permissions for this relationship
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tags Management
CREATE TABLE relationship_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100), -- 'theme', 'stakeholder_type', 'priority'
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_relationship_events_date ON relationship_events(event_date);
CREATE INDEX idx_relationship_events_stakeholder ON relationship_events(stakeholder_name);
CREATE INDEX idx_relationship_events_tags ON relationship_events USING GIN(tags);
CREATE INDEX idx_relationship_events_stage ON relationship_events(relationship_stage);
CREATE INDEX idx_relationship_events_health ON relationship_events(health_score);
CREATE INDEX idx_stakeholder_profiles_name ON stakeholder_profiles(name);
CREATE INDEX idx_stakeholder_profiles_type ON stakeholder_profiles(stakeholder_type);
CREATE INDEX idx_stakeholder_profiles_stage ON stakeholder_profiles(current_stage);
CREATE INDEX idx_relationship_timeline_stakeholder ON relationship_timeline(stakeholder_id);
CREATE INDEX idx_relationship_timeline_date ON relationship_timeline(created_at);

-- Triggers for Updated At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_relationship_events_updated_at 
    BEFORE UPDATE ON relationship_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stakeholder_profiles_updated_at 
    BEFORE UPDATE ON stakeholder_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample Data for Testing
INSERT INTO relationship_tags (name, category, color, description) VALUES
('sustainability', 'theme', '#10B981', 'Environmental and sustainability focus'),
('funding', 'theme', '#F59E0B', 'Funding and financial discussions'),
('cultural', 'theme', '#8B5CF6', 'Cultural and community engagement'),
('social_impact', 'theme', '#EF4444', 'Social impact and community development'),
('government', 'stakeholder_type', '#3B82F6', 'Government agencies and departments'),
('funder', 'stakeholder_type', '#F59E0B', 'Funding organizations and foundations'),
('partner', 'stakeholder_type', '#10B981', 'Strategic partners and collaborators'),
('community', 'stakeholder_type', '#8B5CF6', 'Community organizations and groups'),
('critical', 'priority', '#EF4444', 'Critical priority relationships'),
('high', 'priority', '#F59E0B', 'High priority relationships'),
('medium', 'priority', '#3B82F6', 'Medium priority relationships'),
('low', 'priority', '#6B7280', 'Low priority relationships');

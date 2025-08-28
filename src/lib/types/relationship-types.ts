// Relationship Impact Tracker Types
// SGE V3 GIIS - Stakeholder Relationship Management

export interface RelationshipEvent {
  id: number;
  event_date: string;
  stakeholder_name: string;
  event_name: string;
  purpose: string;
  key_discussion_points: string[];
  follow_up_actions: string[];
  contact_details: ContactDetails;
  tags: string[];
  
  // Relationship Health Metrics
  relationship_stage: RelationshipStage;
  health_score: number; // 0-100 scale
  interaction_quality: InteractionQuality;
  outcome_rating: number; // 1-5 scale
  
  // CRM Integration
  stakeholder_type?: StakeholderType;
  stakeholder_category?: StakeholderCategory;
  priority_level: PriorityLevel;
  
  // User Management
  created_by?: number;
  assigned_to?: number;
  is_public: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface StakeholderProfile {
  id: number;
  name: string;
  organization?: string;
  role?: string;
  email?: string;
  phone?: string;
  address?: string;
  
  // Relationship Metrics
  current_stage: RelationshipStage;
  health_score: number; // 0-100 scale
  last_interaction_date?: string;
  interaction_frequency: InteractionFrequency;
  total_interactions: number;
  
  // Stakeholder Classification
  stakeholder_type?: StakeholderType;
  stakeholder_category?: StakeholderCategory;
  priority_level: PriorityLevel;
  
  // Impact Tracking
  funding_potential?: number;
  partnership_value?: PartnershipValue;
  influence_level?: InfluenceLevel;
  
  // Notes and History
  notes?: string;
  relationship_history?: RelationshipHistoryEntry[];
  
  // User Management
  created_by?: number;
  assigned_to?: number;
  
  created_at: string;
  updated_at: string;
}

export interface RelationshipTimeline {
  id: number;
  stakeholder_id: number;
  event_id?: number;
  stage: RelationshipStage;
  health_score: number;
  notes?: string;
  created_at: string;
}

export interface RelationshipUserRole {
  id: number;
  user_id: number;
  stakeholder_id: number;
  role: UserRole;
  permissions: UserPermissions;
  created_at: string;
}

export interface RelationshipTag {
  id: number;
  name: string;
  category: TagCategory;
  color: string; // Hex color code
  description?: string;
  created_at: string;
}

export interface ContactDetails {
  name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  position?: string;
  linkedin?: string;
  notes?: string;
}

export interface RelationshipHistoryEntry {
  date: string;
  event: string;
  stage: RelationshipStage;
  health_score: number;
  notes?: string;
}

export interface UserPermissions {
  can_edit: boolean;
  can_delete: boolean;
  can_assign: boolean;
  can_view_history: boolean;
  can_export: boolean;
}

// Enums and Constants
export type RelationshipStage = 
  | 'initial_contact'
  | 'active_engagement'
  | 'maintenance'
  | 'partnership'
  | 'stagnant'
  | 'at_risk';

export type InteractionQuality = 
  | 'excellent'
  | 'good'
  | 'neutral'
  | 'poor'
  | 'critical';

export type StakeholderType = 
  | 'funder'
  | 'partner'
  | 'community'
  | 'government'
  | 'media'
  | 'academic'
  | 'industry';

export type StakeholderCategory = 
  | 'sustainability'
  | 'funding'
  | 'cultural'
  | 'social_impact'
  | 'education'
  | 'health'
  | 'environment';

export type PriorityLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type InteractionFrequency = 
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'as_needed';

export type PartnershipValue = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type InfluenceLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type UserRole = 
  | 'owner'
  | 'editor'
  | 'viewer';

export type TagCategory = 
  | 'theme'
  | 'stakeholder_type'
  | 'priority'
  | 'custom';

// Dashboard and Analytics Types
export interface RelationshipDashboardData {
  total_stakeholders: number;
  active_relationships: number;
  at_risk_relationships: number;
  average_health_score: number;
  recent_events: RelationshipEvent[];
  upcoming_follow_ups: RelationshipEvent[];
  health_distribution: HealthDistribution;
  stage_distribution: StageDistribution;
  priority_distribution: PriorityDistribution;
}

export interface HealthDistribution {
  excellent: number; // 80-100
  good: number;      // 60-79
  neutral: number;   // 40-59
  poor: number;      // 20-39
  critical: number;  // 0-19
}

export interface StageDistribution {
  initial_contact: number;
  active_engagement: number;
  maintenance: number;
  partnership: number;
  stagnant: number;
  at_risk: number;
}

export interface PriorityDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

// Search and Filter Types
export interface RelationshipSearchFilters {
  stakeholder_name?: string;
  stakeholder_type?: StakeholderType[];
  stakeholder_category?: StakeholderCategory[];
  priority_level?: PriorityLevel[];
  relationship_stage?: RelationshipStage[];
  health_score_min?: number;
  health_score_max?: number;
  tags?: string[];
  date_from?: string;
  date_to?: string;
  assigned_to?: number;
}

// Form Types
export interface RelationshipEventForm {
  event_date: string;
  stakeholder_name: string;
  event_name: string;
  purpose: string;
  key_discussion_points: string[];
  follow_up_actions: string[];
  contact_details: ContactDetails;
  tags: string[];
  relationship_stage: RelationshipStage;
  health_score: number;
  interaction_quality: InteractionQuality;
  outcome_rating: number;
  stakeholder_type?: StakeholderType;
  stakeholder_category?: StakeholderCategory;
  priority_level: PriorityLevel;
  is_public: boolean;
}

export interface StakeholderProfileForm {
  name: string;
  organization?: string;
  role?: string;
  email?: string;
  phone?: string;
  address?: string;
  current_stage: RelationshipStage;
  health_score: number;
  interaction_frequency: InteractionFrequency;
  stakeholder_type?: StakeholderType;
  stakeholder_category?: StakeholderCategory;
  priority_level: PriorityLevel;
  funding_potential?: number;
  partnership_value?: PartnershipValue;
  influence_level?: InfluenceLevel;
  notes?: string;
}

// API Response Types
export interface RelationshipAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RelationshipListResponse {
  events: RelationshipEvent[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface StakeholderListResponse {
  stakeholders: StakeholderProfile[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

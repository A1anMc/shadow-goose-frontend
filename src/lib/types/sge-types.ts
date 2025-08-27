// SGE-Specific Type Definitions
// Focused on SGE's actual business needs: media projects, cultural representation, social impact

// SGE Grant Types
export interface SGEGrant {
  id: number;
  title: string;
  organization: string;
  amount: number;
  deadline: string;
  category: string;
  status: string;
  description: string;
  eligibility: string;
  requirements: string;
  application_url: string;
  contact_info: string;

  // SGE-Specific Fields
  media_type?: 'documentary' | 'digital' | 'community' | 'multicultural';
  target_audience?: string[];
  social_impact_areas?: string[];
  cultural_representation?: string[];
  diversity_focus?: boolean;

  // SGE Business Tracking
  sge_status?: 'discovered' | 'researching' | 'drafting' | 'submitted' | 'successful' | 'unsuccessful';
  team_assigned?: string[];
  notes?: string[];

  // ML Enhancement Fields
  ml_analysis?: any;
  sge_alignment_score?: number; // 0-100 SGE fit score
  success_prediction?: number; // 0-100 probability
  confidence_interval?: [number, number];
  key_factors?: string[];
  risk_factors?: string[];
  sge_recommendations?: string[];

  created_at: string;
  updated_at: string;
}

// SGE Application Types
export interface SGEApplication {
  id: number;
  grant_id: number;
  status: 'draft' | 'in_progress' | 'submitted' | 'successful' | 'unsuccessful';
  submitted_at?: string;

  // SGE Project Details
  project_title?: string;
  project_description?: string;
  media_type?: string;
  target_audience?: string[];
  social_impact?: string[];
  cultural_elements?: string[];
  budget_amount?: number;

  // Team Collaboration
  team_members?: SGETeamMember[];
  tasks?: SGETask[];
  deadlines?: SGEDeadline[];

  // Document Management
  documents?: SGEDocuments;

  // ML Insights
  completion_score?: number; // 0-100 completion percentage
  missing_elements?: string[];
  optimization_suggestions?: string[];
  sge_impact_prediction?: any;
  success_probability?: number;

  created_at: string;
  updated_at: string;
}

// SGE Team Member
export interface SGETeamMember {
  id: number;
  name: string;
  role: 'creative' | 'finance' | 'operations' | 'leadership';
  email?: string;
  skills?: string[];
  availability?: any;

  // SGE-Specific
  media_expertise?: string[];
  cultural_background?: string[];
  impact_focus_areas?: string[];

  created_at: string;
  updated_at: string;
}

// SGE Task
export interface SGETask {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  category: 'research' | 'writing' | 'budget' | 'documentation' | 'review';
}

// SGE Deadline
export interface SGEDeadline {
  id: string;
  title: string;
  date: string;
  type: 'internal' | 'external' | 'milestone';
  description: string;
  is_critical: boolean;
}

// SGE Documents
export interface SGEDocuments {
  proposal?: SGEDocument;
  budget?: SGEDocument;
  team_cvs?: SGEDocument[];
  impact_reports?: SGEDocument[];
  supporting_materials?: SGEDocument[];
}

// SGE Document
export interface SGEDocument {
  id: number;
  name: string;
  type: 'proposal_template' | 'budget_template' | 'impact_report' | 'team_cv' | 'supporting_material';
  content?: string;
  file_path?: string;
  tags?: string[];

  // SGE-Specific Metadata
  sge_category?: 'media' | 'cultural' | 'social_impact' | 'budget' | 'team';
  reusable_elements?: any;
  framework_alignment?: any;

  // ML Enhancement
  content_optimization?: any;
  impact_enhancement?: any;

  created_at: string;
  updated_at: string;
}

// SGE Profile for ML Matching
export interface SGEProfile {
  media_focus: 'documentary' | 'digital' | 'community' | 'multicultural';
  target_communities: string[];
  social_impact_areas: string[];
  cultural_representation: string[];
  budget_range: [number, number];
  team_capabilities: string[];
}

// SGE Grant Match
export interface SGEGrantMatch {
  grant: SGEGrant;
  match_score: number;
  sge_alignment: {
    media_fit: number;
    cultural_fit: number;
    impact_fit: number;
    team_fit: number;
  };
  recommended_approach: string[];
  success_probability: number;
}

// SGE Success Prediction
export interface SGESuccessPrediction {
  probability: number;
  sge_specific_factors: {
    media_alignment: number;
    cultural_relevance: number;
    impact_clarity: number;
    team_strength: number;
    budget_realism: number;
  };
  recommendations: string[];
  risk_factors: string[];
}

// SGE Business Metrics
export interface SGEBusinessMetrics {
  metric_date: string;
  total_grants_discovered: number;
  applications_submitted: number;
  applications_pending: number;
  applications_won: number;
  success_rate: number;
  funding_secured: number;
  time_saved_hours: number;

  // SGE-Specific Metrics
  media_projects_funded: number;
  cultural_impact_projects: number;
  social_impact_projects: number;
  team_efficiency_score: number;
}

// SGE ML Model
export interface SGEMLModel {
  id: number;
  model_name: string;
  model_version: string;
  model_type: 'grant_matching' | 'success_prediction' | 'content_optimization' | 'impact_enhancement';
  model_path?: string;
  accuracy_score?: number;
  sge_specific_accuracy?: number;
  last_trained?: string;
  is_active: boolean;

  // SGE-Specific Model Info
  sge_media_focus: boolean;
  sge_cultural_focus: boolean;
  sge_impact_focus: boolean;

  created_at: string;
}

// SGE ML Prediction
export interface SGEMLPrediction {
  id: number;
  model_id: number;
  input_data: any;
  prediction_result: any;
  confidence_score?: number;
  sge_relevance_score?: number;

  created_at: string;
}

// SGE Enhanced Story
export interface SGEEnhancedStory {
  original_narrative: string;
  enhanced_narrative: string;
  impact_metrics: SGEImpactMetric[];
  cultural_elements: SGECulturalElement[];
  community_stories: SGECommunityStory[];
  recommendations: string[];
}

// SGE Impact Metric
export interface SGEImpactMetric {
  metric: string;
  value: number;
  unit: string;
  description: string;
  cultural_context?: string;
}

// SGE Cultural Element
export interface SGECulturalElement {
  element: string;
  description: string;
  cultural_significance: string;
  representation_accuracy: number;
}

// SGE Community Story
export interface SGECommunityStory {
  title: string;
  narrative: string;
  community: string;
  impact: string;
  cultural_context: string;
}

// SGE Search Filters
export interface SGESearchFilters {
  media_type?: string[];
  target_audience?: string[];
  social_impact_areas?: string[];
  cultural_representation?: string[];
  diversity_focus?: boolean;
  min_amount?: number;
  max_amount?: number;
  deadline_before?: string;
  sge_status?: string[];
  team_assigned?: string[];
}

// SGE Dashboard Data
export interface SGEDashboardData {
  business_metrics: SGEBusinessMetrics;
  recent_grants: SGEGrant[];
  active_applications: SGEApplication[];
  upcoming_deadlines: SGEDeadline[];
  team_tasks: SGETask[];
  ml_recommendations: {
    next_grants_to_apply: SGEGrant[];
    applications_to_optimize: SGEApplication[];
    team_improvements: string[];
    process_optimizations: string[];
  };
}

// SGE Success Analysis
export interface SGESuccessAnalysis {
  application: SGEApplication;
  grant: SGEGrant;
  prediction: SGESuccessPrediction;
  factors: SGESuccessFactor[];
  recommendations: string[];
  riskAssessment: {
    highRisk: string[];
    mediumRisk: string[];
    lowRisk: string[];
  };
  improvementOpportunities: {
    quickWins: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
}

// SGE Success Factor
export interface SGESuccessFactor {
  factor: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  sgeSpecific: boolean;
}

// SGE Grant Discovery Result
export interface SGEGrantDiscoveryResult {
  grants: SGEGrant[];
  totalFound: number;
  sourcesSearched: number;
  matchDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
  nextRefresh: string;
}

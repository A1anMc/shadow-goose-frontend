/**
 * OKR (Objectives & Key Results) Type Definitions
 * Comprehensive OKR system integrated with impact measurement frameworks
 */

// ============================================================================
// OKR CORE TYPES
// ============================================================================

export interface OKRObjective {
  id: string;
  title: string;
  description: string;
  category: 'strategic' | 'tactical' | 'operational';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  owner: string;
  stakeholders: string[];
  start_date: string;
  end_date: string;
  impact_frameworks: OKRImpactFramework[];
  created_at: string;
  updated_at: string;
}

export interface OKRKeyResult {
  id: string;
  objective_id: string;
  title: string;
  description: string;
  metric: string;
  unit: string;
  target_value: number;
  current_value: number;
  baseline_value: number;
  progress_percentage: number; // 0-100
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  confidence_level: 'high' | 'medium' | 'low';
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface OKRImpactFramework {
  framework: 'SDG' | 'Victorian' | 'CEMP' | 'Triple_Bottom_Line';
  framework_id: string; // Specific goal/outcome/principle ID
  contribution_percentage: number; // 0-100
  evidence: string[];
}

// ============================================================================
// OKR ALIGNMENT & HIERARCHY
// ============================================================================

export interface OKRAlignment {
  id: string;
  parent_okr_id: string;
  child_okr_id: string;
  alignment_type: 'supports' | 'enables' | 'depends_on' | 'conflicts_with';
  strength: 'strong' | 'medium' | 'weak';
  notes: string;
  created_at: string;
}

export interface OKRInitiative {
  id: string;
  title: string;
  description: string;
  objective_id: string;
  key_result_ids: string[];
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  budget: number;
  actual_spend: number;
  team_members: string[];
  deliverables: string[];
  risks: OKRRisk[];
  created_at: string;
  updated_at: string;
}

export interface OKRRisk {
  id: string;
  okr_id: string;
  title: string;
  description: string;
  probability: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation_strategy: string;
  owner: string;
  status: 'active' | 'mitigated' | 'closed';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// OKR TRACKING & MEASUREMENT
// ============================================================================

export interface OKRCheckIn {
  id: string;
  okr_id: string;
  check_in_date: string;
  progress_update: string;
  challenges: string[];
  next_actions: string[];
  confidence_level: 'high' | 'medium' | 'low';
  updated_by: string;
  created_at: string;
}

export interface OKRMeasurement {
  id: string;
  key_result_id: string;
  measurement_date: string;
  value: number;
  notes: string;
  data_source: string;
  confidence_level: 'high' | 'medium' | 'low';
  evidence_files: string[];
  measured_by: string;
  created_at: string;
}

// ============================================================================
// OKR REPORTING & ANALYTICS
// ============================================================================

export interface OKRReport {
  id: string;
  report_period: {
    start_date: string;
    end_date: string;
  };
  objectives: OKRObjective[];
  key_results: OKRKeyResult[];
  initiatives: OKRInitiative[];
  summary: {
    total_objectives: number;
    completed_objectives: number;
    on_track_objectives: number;
    at_risk_objectives: number;
    overall_progress: number; // 0-100
    impact_framework_breakdown: Record<string, number>;
  };
  recommendations: string[];
  generated_at: string;
  generated_by: string;
}

export interface OKRDashboard {
  current_quarter: {
    objectives: OKRObjective[];
    key_results: OKRKeyResult[];
    progress_summary: {
      objectives_on_track: number;
      objectives_at_risk: number;
      objectives_completed: number;
      average_progress: number;
    };
  };
  impact_alignment: {
    sdg_goals: number;
    victorian_outcomes: number;
    cemp_principles: number;
    triple_bottom_line: number;
  };
  upcoming_deadlines: OKRKeyResult[];
  recent_check_ins: OKRCheckIn[];
}

// ============================================================================
// OKR TEMPLATES & STANDARDS
// ============================================================================

export interface OKRTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  objectives: OKRObjectiveTemplate[];
  impact_frameworks: string[];
  created_at: string;
}

export interface OKRObjectiveTemplate {
  title: string;
  description: string;
  category: 'strategic' | 'tactical' | 'operational';
  key_results: OKRKeyResultTemplate[];
  impact_frameworks: OKRImpactFramework[];
}

export interface OKRKeyResultTemplate {
  title: string;
  description: string;
  metric: string;
  unit: string;
  target_value: number;
  baseline_value: number;
}

// ============================================================================
// OKR INTEGRATION WITH EXISTING SYSTEMS
// ============================================================================

export interface OKRProjectMapping {
  okr_id: string;
  project_id: string;
  mapping_type: 'primary' | 'secondary' | 'supporting';
  contribution_percentage: number; // 0-100
  evidence: string[];
  created_at: string;
}

export interface OKRGrantMapping {
  okr_id: string;
  grant_id: string;
  alignment_score: number; // 0-100
  funding_impact: number;
  success_factors: string[];
  risks: string[];
  created_at: string;
}

export interface OKRRelationshipMapping {
  okr_id: string;
  relationship_id: string;
  stakeholder_role: 'supporter' | 'influencer' | 'decision_maker' | 'implementer';
  engagement_level: 'high' | 'medium' | 'low';
  contribution_type: 'funding' | 'expertise' | 'network' | 'resources';
  created_at: string;
}

// ============================================================================
// OKR PERFORMANCE METRICS
// ============================================================================

export interface OKRPerformanceMetrics {
  // Objective Performance
  objective_completion_rate: number; // 0-100
  average_objective_progress: number; // 0-100
  objectives_on_track_percentage: number; // 0-100
  objectives_at_risk_percentage: number; // 0-100
  
  // Key Result Performance
  key_result_completion_rate: number; // 0-100
  average_key_result_progress: number; // 0-100
  key_results_on_track_percentage: number; // 0-100
  
  // Impact Framework Performance
  sdg_alignment_score: number; // 0-100
  victorian_alignment_score: number; // 0-100
  cemp_alignment_score: number; // 0-100
  triple_bottom_line_score: number; // 0-100
  
  // Team Performance
  team_engagement_score: number; // 0-100
  check_in_completion_rate: number; // 0-100
  initiative_success_rate: number; // 0-100
  
  // Financial Performance
  budget_utilization_rate: number; // 0-100
  roi_on_okr_initiatives: number; // Percentage
  cost_per_objective: number; // Currency amount
}

// ============================================================================
// OKR NOTIFICATIONS & ALERTS
// ============================================================================

export interface OKRAlert {
  id: string;
  okr_id: string;
  alert_type: 'deadline_approaching' | 'progress_stalled' | 'target_missed' | 'risk_identified';
  severity: 'high' | 'medium' | 'low';
  message: string;
  action_required: boolean;
  action_items: string[];
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

// ============================================================================
// OKR WORKFLOW & APPROVALS
// ============================================================================

export interface OKRWorkflow {
  id: string;
  okr_id: string;
  current_stage: 'draft' | 'review' | 'approved' | 'active' | 'completed';
  stages: OKRWorkflowStage[];
  current_approver: string;
  approval_history: OKRApproval[];
  created_at: string;
  updated_at: string;
}

export interface OKRWorkflowStage {
  stage: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assigned_to: string;
  due_date: string;
  completed_at?: string;
  notes: string;
}

export interface OKRApproval {
  id: string;
  okr_id: string;
  approver: string;
  action: 'approve' | 'reject' | 'request_changes';
  comments: string;
  approved_at: string;
}

// ============================================================================
// OKR EXPORT & INTEGRATION
// ============================================================================

export interface OKRExport {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  data: {
    objectives: OKRObjective[];
    key_results: OKRKeyResult[];
    initiatives: OKRInitiative[];
    measurements: OKRMeasurement[];
    performance_metrics: OKRPerformanceMetrics;
  };
  filters: {
    date_range?: { start: string; end: string };
    categories?: string[];
    status?: string[];
    owners?: string[];
  };
  generated_at: string;
  generated_by: string;
}

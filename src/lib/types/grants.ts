// STANDARDIZED GRANT TYPE DEFINITIONS
// Single source of truth for all grant-related types across the entire application
// This prevents type inconsistencies and makes the system maintainable

export type GrantStatus = 'open' | 'closed' | 'expired' | 'closing_soon' | 'closing_today' | 'planning';

export type GrantDataSource = 'api' | 'fallback' | 'cache' | 'real' | 'research' | 'creative_australia' | 'screen_australia' | 'vic_screen' | 'regional_arts';

export interface Grant {
  id: number | string;
  title: string;                    // Standardized on 'title' not 'name'
  description: string;
  amount: number;
  category: string;
  deadline: string;
  status: GrantStatus;
  eligibility: string[];
  requirements: string[];
  success_score?: number;
  success_probability?: number;
  time_to_apply?: number;
  sdg_alignment?: string[];
  geographic_focus?: string[];
  application_url?: string;
  contact_info?: string;
  organization?: string;
  created_at: string;
  updated_at: string;
  data_source?: GrantDataSource;
  // New unified pipeline fields
  priority_score?: number;
  days_until_deadline?: number;
  sge_alignment_score?: number;
}

export interface GrantSearchFilters {
  category?: string;
  minAmount?: number;               // Standardized on camelCase
  maxAmount?: number;               // Standardized on camelCase
  searchTerm?: string;              // Standardized on 'searchTerm'
  deadlineBefore?: string;          // Standardized on camelCase
  status?: string;
  keywords?: string;                // Keep for backward compatibility
}

export interface GrantRecommendation {
  grant: Grant;
  match_score: number;
  reasons: string[];
  success_probability: number;
}

export interface GrantQuestion {
  id: string;
  question: string;
  type: 'budget' | 'creative' | 'impact' | 'legal' | 'technical' | 'general' | 'methodology' | 'timeline' | 'team' | 'sustainability';
  required: boolean;
  max_length?: number;
  options?: string[];
  help_text?: string;
  category: 'project_overview' | 'objectives' | 'methodology' | 'budget' | 'timeline' | 'team' | 'outcomes' | 'risk_management' | 'sustainability';
  assigned_to?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed';
  answer?: string;
  last_updated?: string;
  updated_by?: number;
}

export interface GrantApplication {
  id: number;
  grant_id: number;
  user_id: number;
  title?: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: number;
  answers: GrantAnswer[];
  comments: GrantComment[];
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  // Enhanced project management fields
  project_id?: number; // Link to SGE project
  team_assignments: TeamAssignment[];
  questions: GrantQuestion[];
  progress: ApplicationProgress;
  collaborators: Collaborator[];
  workflow_stage: 'planning' | 'writing' | 'review' | 'approval' | 'submission';
  deadline_reminders: DeadlineReminder[];
}

export interface GrantAnswer {
  id: number;
  application_id: number;
  question: string;
  answer: string;
  author_id: number;
  author?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface GrantComment {
  id: number;
  application_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface TeamAssignment {
  id: number;
  application_id: number;
  question_id?: string;
  user_id: number;
  role: 'writer' | 'reviewer' | 'approver' | 'coordinator' | 'expert';
  assigned_at: string;
  due_date?: string;
  completed_at?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  responsibilities: string[];
  permissions: string[];
}

export interface Collaborator {
  id: number;
  application_id: number;
  user_id: number;
  email: string;
  name: string;
  role: 'writer' | 'reviewer' | 'approver' | 'viewer';
  invited_at: string;
  accepted_at?: string;
  permissions: string[];
  last_active?: string;
}

export interface ApplicationProgress {
  total_questions: number;
  completed_questions: number;
  percentage_complete: number;
  sections_complete: string[];
  sections_pending: string[];
  estimated_completion_time?: string;
  last_activity?: string;
  next_deadline?: string;
}

export interface DeadlineReminder {
  id: number;
  application_id: number;
  type: 'draft' | 'review' | 'submission' | 'follow_up';
  due_date: string;
  reminder_date: string;
  sent: boolean;
  message: string;
  recipients: string[];
}

// Response types for API calls
export interface GrantsResponse {
  grants: Grant[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface GrantSearchResponse {
  grants: Grant[];
  total: number;
  filters: GrantSearchFilters;
  searchTime: number;
}

export interface GrantApplicationResponse {
  application: GrantApplication;
  grant: Grant;
  progress: ApplicationProgress;
}

// Utility types for service responses
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface BulletproofResponse<T> {
  data: T;
  source: 'primary' | 'fallback' | 'cache';
  timestamp: string;
  reliability: number; // 0-100
  errors: string[];
}

// Type guards for runtime type checking
export const isGrant = (obj: any): obj is Grant => {
  return obj &&
         typeof obj.id !== 'undefined' &&
         typeof obj.title === 'string' &&
         typeof obj.description === 'string' &&
         typeof obj.amount === 'number';
};

export const isGrantArray = (obj: any): obj is Grant[] => {
  return Array.isArray(obj) && obj.every(isGrant);
};

export const isGrantSearchFilters = (obj: any): obj is GrantSearchFilters => {
  return obj && typeof obj === 'object';
};

// Utility functions for grant operations
export const getGrantStatusColor = (status: GrantStatus): string => {
  switch (status) {
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'closing_soon':
      return 'bg-yellow-100 text-yellow-800';
    case 'closing_today':
      return 'bg-orange-100 text-orange-800';
    case 'closed':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-gray-100 text-gray-800';
    case 'planning':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getDaysUntilDeadline = (deadline: string): number => {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getUrgencyLevel = (deadline: string): 'expired' | 'today' | 'urgent' | 'soon' | 'normal' => {
  const days = getDaysUntilDeadline(deadline);
  if (days < 0) return 'expired';
  if (days === 0) return 'today';
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'soon';
  return 'normal';
};

// AI Writing Assistant Types and Interfaces
// Centralized type definitions for AI writing functionality

export interface AIWritingPrompt {
  grant_title: string;
  grant_description: string;
  grant_amount: number;
  grant_category: string;
  organization_profile: {
    name: string;
    type: string;
    mission: string;
    years_operating: number;
    previous_projects: string[];
    team_expertise: string[];
  };
  project_details: {
    title: string;
    objectives: string[];
    target_audience: string;
    timeline: number;
    budget: number;
  };
  writing_section: 'project_overview' | 'objectives_outcomes' | 'implementation_plan' | 'budget_breakdown' | 'risk_management';
  word_limit: number;
  tone: 'professional' | 'compelling' | 'technical' | 'storytelling';
}

export interface GrantContentRequest {
  section: string;
  grant_context: {
    name: string;
    description: string;
    category: string;
    amount: number;
    requirements: string[];
    eligibility: string[];
  };
  existing_content: string;
  user_context: string;
}

export interface AIWritingResponse {
  content: string;
  word_count: number;
  quality_score: number;
  suggestions: string[];
  alternative_versions: string[];
  compliance_check: {
    grant_alignment: number;
    completeness: number;
    clarity: number;
    persuasiveness: number;
  };
}

export interface AITemplate {
  id: string;
  name: string;
  category: string;
  sections: {
    project_overview: string;
    objectives_outcomes: string;
    implementation_plan: string;
    budget_breakdown: string;
    risk_management: string;
  };
  success_rate: number;
  usage_count: number;
}

export interface ContentAnalysisResult {
  grant_alignment: number;
  completeness: number;
  clarity: number;
  persuasiveness: number;
  overall_score: number;
  feedback: string[];
  improvement_suggestions: string[];
  compliance_issues: string[];
}

export interface ProfessionalTemplate {
  id: string;
  name: string;
  description: string;
  sections: Record<string, string>;
  success_rate: number;
  best_practices: string[];
}

export interface TemplateCollection {
  templates: ProfessionalTemplate[];
  writing_guidelines: string[];
  common_mistakes: string[];
}

export interface AIWritingConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

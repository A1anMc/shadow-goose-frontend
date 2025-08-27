// AI Writing Templates Service
// Handles professional grant writing templates and guidelines

import { aiLogger } from '../logger';
import { AITemplate, TemplateCollection } from './types';

export class AITemplateService {
  private templates: AITemplate[] = [];
  private templateCollections: Map<string, TemplateCollection> = new Map();

  constructor() {
    this.initializeTemplates();
    this.initializeTemplateCollections();
  }

  private initializeTemplates(): void {
    this.templates = [
      {
        id: 'arts-community-engagement',
        name: 'Community Arts Engagement Template',
        category: 'arts_culture',
        sections: {
          project_overview: 'Our community arts project will create inclusive, accessible arts experiences that bring together diverse community members...',
          objectives_outcomes: '1. Engage 500+ community members in arts activities\n2. Provide arts education for 100+ participants\n3. Create 5 public art installations\n4. Establish 3 community partnerships',
          implementation_plan: 'We will use participatory arts methods, community consultation, and collaborative creation processes...',
          budget_breakdown: 'Artist fees: $12,000\nMaterials: $5,000\nVenue costs: $3,000\nMarketing: $2,000\nAdministration: $3,000',
          risk_management: 'Risk mitigation strategies include community consultation, flexible timelines, and contingency planning.'
        },
        success_rate: 85,
        usage_count: 0
      },
      {
        id: 'documentary-production',
        name: 'Documentary Production Template',
        category: 'documentary',
        sections: {
          project_overview: 'We will produce a compelling documentary that explores [topic] through authentic storytelling and innovative filmmaking techniques...',
          objectives_outcomes: '1. Complete a 60-minute documentary film\n2. Conduct 50+ interviews with key stakeholders\n3. Create 10 short-form digital content pieces\n4. Reach 100,000+ viewers through multiple platforms',
          implementation_plan: 'Our methodology includes extensive research, stakeholder consultation, multi-platform filming, collaborative editing processes, and strategic distribution planning...',
          budget_breakdown: 'Equipment and filming: $25,000\nPost-production: $15,000\nTravel and logistics: $8,000\nMarketing and distribution: $5,000\nAdministration: $2,000',
          risk_management: 'Risk mitigation includes backup equipment, flexible shooting schedules, and multiple distribution strategies.'
        },
        success_rate: 82,
        usage_count: 0
      }
    ];
  }

  private initializeTemplateCollections(): void {
    // Arts & Culture Templates
    this.templateCollections.set('arts_culture', {
      templates: [
        {
          id: 'arts-community-engagement',
          name: 'Community Arts Engagement Template',
          description: 'Template for arts projects that engage diverse communities',
          sections: {
            project_overview: 'Our community arts project will create inclusive, accessible arts experiences that bring together diverse community members...',
            objectives: '1. Engage 500+ community members in arts activities\n2. Provide arts education for 100+ participants\n3. Create 5 public art installations\n4. Establish 3 community partnerships',
            methodology: 'We will use participatory arts methods, community consultation, and collaborative creation processes...',
            budget: 'Artist fees: $12,000\nMaterials: $5,000\nVenue costs: $3,000\nMarketing: $2,000\nAdministration: $3,000',
            outcomes: 'Increased community cohesion, enhanced arts accessibility, documented community stories, and sustainable arts programming.'
          },
          success_rate: 85,
          best_practices: [
            'Emphasize community consultation and participation',
            'Include specific engagement numbers and demographics',
            'Demonstrate cultural sensitivity and inclusivity',
            'Show clear connection to community needs'
          ]
        }
      ],
      writing_guidelines: [
        'Use inclusive language that reflects community diversity',
        'Include specific numbers and measurable outcomes',
        'Demonstrate understanding of local arts landscape',
        'Show how the project addresses community needs'
      ],
      common_mistakes: [
        'Vague objectives without measurable outcomes',
        'Lack of community consultation evidence',
        'Generic project descriptions',
        'Insufficient budget justification'
      ]
    });

    // Documentary Templates
    this.templateCollections.set('documentary', {
      templates: [
        {
          id: 'documentary-production',
          name: 'Documentary Production Template',
          description: 'Template for documentary film and media projects',
          sections: {
            project_overview: 'We will produce a compelling documentary that explores [topic] through authentic storytelling and innovative filmmaking techniques...',
            objectives: '1. Complete a 60-minute documentary film\n2. Conduct 50+ interviews with key stakeholders\n3. Create 10 short-form digital content pieces\n4. Reach 100,000+ viewers through multiple platforms',
            methodology: 'Our methodology includes extensive research, stakeholder consultation, multi-platform filming, collaborative editing processes, and strategic distribution planning...',
            budget: 'Equipment and filming: $25,000\nPost-production: $15,000\nTravel and logistics: $8,000\nMarketing and distribution: $5,000\nAdministration: $2,000',
            outcomes: 'A professionally produced documentary that raises awareness, influences public discourse, and creates lasting impact through multiple distribution channels.'
          },
          success_rate: 82,
          best_practices: [
            'Include detailed production timeline',
            'Demonstrate access to key interviewees',
            'Show distribution and audience reach strategy',
            'Provide evidence of team expertise'
          ]
        }
      ],
      writing_guidelines: [
        'Include specific production details and timeline',
        'Demonstrate access to key subjects or locations',
        'Show clear distribution and audience strategy',
        'Provide evidence of team filmmaking expertise'
      ],
      common_mistakes: [
        'Unrealistic production timelines',
        'Lack of access confirmation to key subjects',
        'Vague distribution strategy',
        'Insufficient budget for post-production'
      ]
    });
  }

  // Get all templates
  getTemplates(): AITemplate[] {
    return [...this.templates];
  }

  // Get templates by category
  getTemplatesByCategory(category: string): AITemplate[] {
    return this.templates.filter(template => template.category === category);
  }

  // Get template by ID
  getTemplateById(id: string): AITemplate | undefined {
    return this.templates.find(template => template.id === id);
  }

  // Get professional templates for a grant category
  getProfessionalTemplates(grantCategory: string): TemplateCollection {
    const collection = this.templateCollections.get(grantCategory);

    if (collection) {
      aiLogger.info('Retrieved professional templates', 'getProfessionalTemplates', { grantCategory, templateCount: collection.templates.length });
      return collection;
    }

    // Return default collection if category not found
    aiLogger.warn('No templates found for category, using defaults', 'getProfessionalTemplates', { grantCategory });
    return {
      templates: [],
      writing_guidelines: [
        'Be specific and measurable in your objectives',
        'Include detailed methodology and timeline',
        'Provide comprehensive budget breakdown',
        'Demonstrate team qualifications and experience'
      ],
      common_mistakes: [
        'Vague or unmeasurable objectives',
        'Lack of detailed methodology',
        'Insufficient budget justification',
        'Missing team qualifications'
      ]
    };
  }

  // Add new template
  addTemplate(template: AITemplate): void {
    this.templates.push(template);
    aiLogger.info('Added new template', 'addTemplate', { templateId: template.id, category: template.category });
  }

  // Update template usage count
  incrementUsageCount(templateId: string): void {
    const template = this.getTemplateById(templateId);
    if (template) {
      template.usage_count++;
      aiLogger.debug('Incremented template usage count', 'incrementUsageCount', { templateId, newCount: template.usage_count });
    }
  }

  // Get most successful templates
  getTopTemplates(limit: number = 5): AITemplate[] {
    return this.templates
      .sort((a, b) => b.success_rate - a.success_rate)
      .slice(0, limit);
  }

  // Get most used templates
  getMostUsedTemplates(limit: number = 5): AITemplate[] {
    return this.templates
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, limit);
  }
}

// Export singleton instance
export const aiTemplateService = new AITemplateService();

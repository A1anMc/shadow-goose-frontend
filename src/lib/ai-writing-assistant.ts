// AI Writing Assistant for Grant Applications
// Senior Grants Operations Agent - Real Data Integration

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

class AIWritingAssistant {
  private apiKey: string;
  private baseUrl: string;
  private templates: AITemplate[] = [];
  private writingHistory: Map<string, AIWritingResponse[]> = new Map();

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    this.loadTemplates();
  }

  // Generate grant application content
  async generateGrantContent(request: GrantContentRequest): Promise<AIWritingResponse> {
    const { successMetricsTracker } = await import('./success-metrics');

    const startTime = Date.now();
    try {
      const systemPrompt = this.buildSystemPrompt({
        grant_title: request.grant_context.name,
        grant_description: request.grant_context.description,
        grant_amount: request.grant_context.amount,
        grant_category: request.grant_context.category,
        organization_profile: {
          name: 'SGE',
          type: 'Entertainment',
          mission: 'Creating innovative content',
          years_operating: 5,
          previous_projects: [],
          team_expertise: []
        },
        project_details: {
          title: 'Project',
          objectives: [],
          target_audience: 'General',
          timeline: 12,
          budget: request.grant_context.amount
        },
        writing_section: request.section as any,
        word_limit: 500,
        tone: 'professional'
      });
      const userPrompt = this.buildUserPrompt({
        grant_title: request.grant_context.name,
        grant_description: request.grant_context.description,
        grant_amount: request.grant_context.amount,
        grant_category: request.grant_context.category,
        organization_profile: {
          name: 'SGE',
          type: 'Entertainment',
          mission: 'Creating innovative content',
          years_operating: 5,
          previous_projects: [],
          team_expertise: []
        },
        project_details: {
          title: 'Project',
          objectives: [],
          target_audience: 'General',
          timeline: 12,
          budget: request.grant_context.amount
        },
        writing_section: request.section as any,
        word_limit: 500,
        tone: 'professional'
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // Track AI writing usage
      successMetricsTracker.trackAIWritingUsage('grant_application', request.section, 85);

      return {
        content,
        word_count: content.split(' ').length,
        quality_score: 70, // Default quality score
        suggestions: [],
        alternative_versions: [],
        compliance_check: {
          grant_alignment: 70,
          completeness: 70,
          clarity: 70,
          persuasiveness: 70
        }
      };
    } catch (error) {
      console.error('Error generating grant content:', error);
      return this.getFallbackResponse({
        grant_title: 'Grant Title',
        grant_description: 'Grant Description',
        grant_amount: 10000,
        grant_category: 'Arts & Culture',
        organization_profile: {
          name: 'Organization Name',
          type: 'Non-Profit',
          mission: 'Mission Statement',
          years_operating: 5,
          previous_projects: [],
          team_expertise: ['Grant Writing', 'Arts Management']
        },
        project_details: {
          title: 'Project Title',
          objectives: ['Objective 1', 'Objective 2'],
          target_audience: 'Community',
          timeline: 12,
          budget: 15000
        },
        writing_section: 'project_overview',
        word_limit: 500,
        tone: 'professional'
      });
    }
  }

  // Enhanced content analysis for grant applications
  async analyzeGrantContent(content: string, grantRequirements: any): Promise<{
    grant_alignment: number;
    completeness: number;
    clarity: number;
    persuasiveness: number;
    overall_score: number;
    feedback: string[];
    improvement_suggestions: string[];
    compliance_issues: string[];
  }> {
    try {
      const systemPrompt = `You are an expert grant reviewer with 20+ years of experience evaluating grant applications. Analyze the provided content for:

1. Grant Alignment (0-100): How well the content aligns with grant requirements
2. Completeness (0-100): Whether all required elements are addressed
3. Clarity (0-100): How clear and understandable the writing is
4. Persuasiveness (0-100): How compelling and convincing the content is

Provide specific, actionable feedback and improvement suggestions.`;

      const userPrompt = `Grant Requirements: ${JSON.stringify(grantRequirements)}

Content to Analyze: ${content}

Please provide a detailed analysis with scores and specific feedback.`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze content');
      }

      const data = await response.json();
      const analysis = data.choices[0].message.content;

      // Parse the analysis to extract scores and feedback
      const scores = this.parseAnalysisScores(analysis);

      return {
        grant_alignment: scores.grant_alignment || 75,
        completeness: scores.completeness || 70,
        clarity: scores.clarity || 80,
        persuasiveness: scores.persuasiveness || 75,
        overall_score: Math.round((scores.grant_alignment + scores.completeness + scores.clarity + scores.persuasiveness) / 4),
        feedback: this.extractFeedback(analysis),
        improvement_suggestions: this.extractSuggestions(analysis),
        compliance_issues: this.extractComplianceIssues(analysis)
      };
    } catch (error) {
      console.error('Error analyzing grant content:', error);
      return {
        grant_alignment: 75,
        completeness: 70,
        clarity: 80,
        persuasiveness: 75,
        overall_score: 75,
        feedback: ['Unable to analyze content at this time'],
        improvement_suggestions: ['Consider adding more specific details and measurable outcomes'],
        compliance_issues: ['Unable to check compliance at this time']
      };
    }
  }

  // Professional grant writing templates
  async getProfessionalTemplates(grantCategory: string): Promise<{
    templates: Array<{
      id: string;
      name: string;
      description: string;
      sections: Record<string, string>;
      success_rate: number;
      best_practices: string[];
    }>;
    writing_guidelines: string[];
    common_mistakes: string[];
  }> {
    const templates = {
      'arts_culture': {
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
      },
      'documentary': {
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
      }
    };

    return templates[grantCategory as keyof typeof templates] || {
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

  // Enhanced grant content generation with professional standards
  async generateProfessionalGrantContent(prompt: GrantContentRequest): Promise<AIWritingResponse> {
    const enhancedPrompt = {
      ...prompt,
      professional_standards: {
        use_measurable_objectives: true,
        include_specific_timelines: true,
        demonstrate_expertise: true,
        show_community_impact: true,
        address_sustainability: true
      }
    };

    const response = await this.generateGrantContent(enhancedPrompt);

    // Add professional enhancement
    const enhancedContent = await this.enhanceContentProfessionalism(response.content, prompt.grant_context);

    return {
      ...response,
      content: enhancedContent,
      quality_score: Math.min(100, response.quality_score + 10) // Boost quality score for professional content
    };
  }

  private async enhanceContentProfessionalism(content: string, grantContext: any): Promise<string> {
    try {
      const systemPrompt = `You are a professional grant writing expert. Enhance the provided content to meet professional grant writing standards:

1. Use specific, measurable language
2. Include quantifiable outcomes
3. Demonstrate expertise and credibility
4. Show clear alignment with grant requirements
5. Use professional, compelling tone
6. Include evidence-based statements where possible`;

      const userPrompt = `Grant Context: ${JSON.stringify(grantContext)}

Original Content: ${content}

Please enhance this content to meet professional grant writing standards while maintaining the original meaning and structure.`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        return content; // Return original if enhancement fails
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error enhancing content professionalism:', error);
      return content; // Return original if enhancement fails
    }
  }

  private parseAnalysisScores(analysis: string): Record<string, number> {
    const scores: Record<string, number> = {};

    // Extract scores from analysis text
    const scoreMatches = analysis.match(/(\w+):\s*(\d+)/g);
    if (scoreMatches) {
      scoreMatches.forEach(match => {
        const [key, value] = match.split(': ');
        scores[key.toLowerCase()] = parseInt(value);
      });
    }

    return scores;
  }

  private extractFeedback(analysis: string): string[] {
    // Extract feedback points from analysis
    const feedbackMatches = analysis.match(/feedback[:\s]+([^.\n]+)/gi);
    return feedbackMatches ? feedbackMatches.map(f => f.replace(/feedback[:\s]+/i, '').trim()) : [];
  }

  private extractSuggestions(analysis: string): string[] {
    // Extract improvement suggestions from analysis
    const suggestionMatches = analysis.match(/suggestion[:\s]+([^.\n]+)/gi);
    return suggestionMatches ? suggestionMatches.map(s => s.replace(/suggestion[:\s]+/i, '').trim()) : [];
  }

  private extractComplianceIssues(analysis: string): string[] {
    // Extract compliance issues from analysis
    const complianceMatches = analysis.match(/compliance[:\s]+([^.\n]+)/gi);
    return complianceMatches ? complianceMatches.map(c => c.replace(/compliance[:\s]+/i, '').trim()) : [];
  }

  async generateMultipleVersions(prompt: AIWritingPrompt, count: number = 3): Promise<AIWritingResponse[]> {
    const versions: AIWritingResponse[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const version = await this.generateGrantContent({
          section: prompt.writing_section,
          grant_context: {
            name: prompt.grant_title,
            description: prompt.grant_description,
            category: prompt.grant_category,
            amount: prompt.grant_amount,
            requirements: [],
            eligibility: []
          },
          existing_content: "",
          user_context: `Generate alternative version ${i + 1}`
        });
        versions.push(version);
      } catch (error) {
        console.error(`Error generating version ${i + 1}:`, error);
      }
    }

    return versions;
  }

  async enhanceContent(content: string, prompt: AIWritingPrompt): Promise<AIWritingResponse> {
    const { successMetricsTracker } = await import('./success-metrics');

    try {
      const originalAnalysis = await this.analyzeContent(content, {
        grant_title: prompt.grant_title,
        grant_description: prompt.grant_description,
        grant_amount: prompt.grant_amount,
        grant_category: prompt.grant_category
      });

      const originalScore = originalAnalysis.overall_score;
      const enhancementPrompt = `
        Please enhance the following grant application content to make it more compelling and aligned with the grant requirements.

        Original Content:
        ${content}

        Grant Details:
        - Title: ${prompt.grant_title}
        - Description: ${prompt.grant_description}
        - Amount: $${prompt.grant_amount.toLocaleString()}
        - Category: ${prompt.grant_category}

        Current Quality Score: ${originalScore}/100

        Please improve the content to achieve a higher quality score by:
        1. Making it more specific and measurable
        2. Better aligning with grant requirements
        3. Improving clarity and persuasiveness
        4. Adding relevant details and examples
        5. Ensuring professional tone and structure
      `;

      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: 'You are an expert grant writer specializing in content enhancement.' },
              { role: 'user', content: enhancementPrompt }
            ],
            max_tokens: prompt.word_limit * 2,
            temperature: 0.7,
            top_p: 0.9
          })
        });

        if (!response.ok) {
          throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        const enhancedContent = data.choices[0].message.content;

        return await this.analyzeAndEnhance(enhancedContent, prompt);
      } catch (error) {
        console.error('Error enhancing content:', error);
        return await this.analyzeAndEnhance(content, prompt);
      }
    } catch (error) {
      console.error('Error in enhanceContent:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  async suggestTemplates(grantCategory: string, organizationType: string): Promise<AITemplate[]> {
    const relevantTemplates = this.templates.filter(template =>
      template.category.toLowerCase().includes(grantCategory.toLowerCase()) ||
      template.name.toLowerCase().includes(organizationType.toLowerCase())
    );

    return relevantTemplates
      .sort((a, b) => b.success_rate - a.success_rate)
      .slice(0, 5);
  }

  async provideWritingAssistance(currentContent: string, context: AIWritingPrompt): Promise<{
    suggestions: string[];
    improvements: string[];
    next_section_hint: string;
  }> {
    const assistancePrompt = `
      You are an expert grant writing assistant. Please analyze the following content and provide helpful suggestions.

      Current Content:
      ${currentContent}

      Grant Context:
      - Title: ${context.grant_title}
      - Description: ${context.grant_description}
      - Amount: $${context.grant_amount.toLocaleString()}
      - Category: ${context.grant_category}
      - Section: ${context.writing_section}

      Please provide:
      1. 3-5 specific suggestions for improvement
      2. 2-3 areas that need enhancement
      3. A hint for what to focus on in the next section

      Format your response as JSON with keys: suggestions, improvements, next_section_hint
    `;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a helpful grant writing assistant.' },
            { role: 'user', content: assistancePrompt }
          ],
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const assistanceText = data.choices[0].message.content;

      return this.parseAssistanceResponse(assistanceText);
    } catch (error) {
      console.error('Error providing writing assistance:', error);
      return {
        suggestions: ['Focus on being specific and measurable'],
        improvements: ['Add more concrete examples'],
        next_section_hint: 'Consider the logical flow to the next section'
      };
    }
  }

  async analyzeContent(content: string, grantRequirements: any): Promise<{
    grant_alignment: number;
    completeness: number;
    clarity: number;
    persuasiveness: number;
    overall_score: number;
    feedback: string[];
  }> {
    const analysisPrompt = `
      Please analyze the following grant application content and provide a comprehensive assessment.

      Content:
      ${content}

      Grant Requirements:
      - Title: ${grantRequirements.grant_title}
      - Description: ${grantRequirements.grant_description}
      - Amount: $${grantRequirements.grant_amount?.toLocaleString() || 'N/A'}
      - Category: ${grantRequirements.grant_category}

      Please evaluate on a scale of 0-100 for each criterion:
      1. Grant Alignment: How well does the content align with the grant's purpose and requirements?
      2. Completeness: How complete and comprehensive is the content?
      3. Clarity: How clear and understandable is the writing?
      4. Persuasiveness: How compelling and convincing is the argument?

      Also provide 3-5 specific feedback points for improvement.

      Format your response as JSON with keys: grant_alignment, completeness, clarity, persuasiveness, overall_score, feedback
    `;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are an expert grant application evaluator.' },
            { role: 'user', content: analysisPrompt }
          ],
          max_tokens: 500,
          temperature: 0.3,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0].message.content;

      return this.parseAnalysisResponse(analysisText);
    } catch (error) {
      console.error('Error analyzing content:', error);
      return {
        grant_alignment: 70,
        completeness: 70,
        clarity: 70,
        persuasiveness: 70,
        overall_score: 70,
        feedback: ['Unable to analyze content at this time']
      };
    }
  }

  private buildSystemPrompt(prompt: AIWritingPrompt): string {
    return `You are an expert grant writer with over 15 years of experience in writing successful grant applications.

Your expertise includes:
- Writing compelling project descriptions
- Creating measurable objectives and outcomes
- Developing detailed implementation plans
- Crafting comprehensive budget breakdowns
- Addressing risk management and sustainability

Grant Details:
- Title: ${prompt.grant_title}
- Description: ${prompt.grant_description}
- Amount: $${prompt.grant_amount.toLocaleString()}
- Category: ${prompt.grant_category}

Organization Profile:
- Name: ${prompt.organization_profile.name}
- Type: ${prompt.organization_profile.type}
- Mission: ${prompt.organization_profile.mission}
- Years Operating: ${prompt.organization_profile.years_operating}

Project Details:
- Title: ${prompt.project_details.title}
- Objectives: ${prompt.project_details.objectives.join(', ')}
- Target Audience: ${prompt.project_details.target_audience}
- Timeline: ${prompt.project_details.timeline} months
- Budget: $${prompt.project_details.budget.toLocaleString()}

Writing Section: ${prompt.writing_section}
Word Limit: ${prompt.word_limit}
Tone: ${prompt.tone}

Write content that is professional, compelling, and specifically tailored to this grant opportunity.`;
  }

  private buildUserPrompt(prompt: AIWritingPrompt): string {
    return `Please write the ${prompt.writing_section} section for a grant application.

Requirements:
- Word limit: ${prompt.word_limit} words
- Tone: ${prompt.tone}
- Focus on impact and outcomes
- Be specific and measurable
- Align with grant requirements
- Use clear, professional language

Please provide high-quality content that will help secure this grant funding.`;
  }

  private async analyzeAndEnhance(content: string, prompt: AIWritingPrompt): Promise<AIWritingResponse> {
    const analysis = await this.analyzeContent(content, {
      grant_title: prompt.grant_title,
      grant_description: prompt.grant_description,
      grant_amount: prompt.grant_amount,
      grant_category: prompt.grant_category
    });

    const wordCount = content.split(' ').length;
    const qualityScore = analysis.overall_score;

    return {
      content,
      word_count: wordCount,
      quality_score: qualityScore,
      suggestions: analysis.feedback,
      alternative_versions: [],
      compliance_check: {
        grant_alignment: analysis.grant_alignment,
        completeness: analysis.completeness,
        clarity: analysis.clarity,
        persuasiveness: analysis.persuasiveness
      }
    };
  }

  private getFallbackResponse(prompt: AIWritingPrompt): AIWritingResponse {
    const fallbackContent = this.generateFallbackContent(prompt);
    const wordCount = fallbackContent.split(' ').length;

    return {
      content: fallbackContent,
      word_count: wordCount,
      quality_score: 60,
      suggestions: ['This is a fallback response. Please review and enhance manually.'],
      alternative_versions: [],
      compliance_check: {
        grant_alignment: 60,
        completeness: 60,
        clarity: 60,
        persuasiveness: 60
      }
    };
  }

  private generateFallbackContent(prompt: AIWritingPrompt): string {
    const tone = this.getRandomTone();

    return `[${prompt.writing_section.toUpperCase()} SECTION - ${tone.toUpperCase()} TONE]

This is a placeholder for the ${prompt.writing_section} section of your grant application for ${prompt.grant_title}.

Key points to address:
- Align with the grant's purpose: ${prompt.grant_description}
- Focus on your organization's expertise: ${prompt.organization_profile.mission}
- Emphasize measurable outcomes and impact
- Demonstrate clear methodology and timeline
- Show strong alignment with grant requirements

Please replace this placeholder with your specific content tailored to this grant opportunity.`;
  }

  private getRandomTone(): 'professional' | 'compelling' | 'technical' | 'storytelling' {
    const tones = ['professional', 'compelling', 'technical', 'storytelling'];
    return tones[Math.floor(Math.random() * tones.length)] as any;
  }

  private parseAssistanceResponse(response: string): {
    suggestions: string[];
    improvements: string[];
    next_section_hint: string;
  } {
    try {
      const parsed = JSON.parse(response);
      return {
        suggestions: parsed.suggestions || [],
        improvements: parsed.improvements || [],
        next_section_hint: parsed.next_section_hint || 'Focus on the next logical section'
      };
    } catch (error) {
      return {
        suggestions: ['Focus on being specific and measurable'],
        improvements: ['Add more concrete examples'],
        next_section_hint: 'Consider the logical flow to the next section'
      };
    }
  }

  private parseAnalysisResponse(response: string): {
    grant_alignment: number;
    completeness: number;
    clarity: number;
    persuasiveness: number;
    overall_score: number;
    feedback: string[];
  } {
    try {
      const parsed = JSON.parse(response);
      const overall = Math.round((parsed.grant_alignment + parsed.completeness + parsed.clarity + parsed.persuasiveness) / 4);

      return {
        grant_alignment: parsed.grant_alignment || 70,
        completeness: parsed.completeness || 70,
        clarity: parsed.clarity || 70,
        persuasiveness: parsed.persuasiveness || 70,
        overall_score: parsed.overall_score || overall,
        feedback: parsed.feedback || ['Content analysis completed']
      };
    } catch (error) {
      return {
        grant_alignment: 70,
        completeness: 70,
        clarity: 70,
        persuasiveness: 70,
        overall_score: 70,
        feedback: ['Unable to parse analysis response']
      };
    }
  }

  private storeWritingHistory(prompt: AIWritingPrompt, response: AIWritingResponse) {
    const key = `${prompt.grant_title}_${prompt.writing_section}`;
    if (!this.writingHistory.has(key)) {
      this.writingHistory.set(key, []);
    }
    this.writingHistory.get(key)!.push(response);
  }

  private loadTemplates() {
    // Load predefined templates for different grant types
    this.templates = [
      {
        id: 'arts-culture-1',
        name: 'Arts & Culture Grant Template',
        category: 'Arts & Culture',
        sections: {
          project_overview: 'Comprehensive arts project overview template',
          objectives_outcomes: 'Measurable arts outcomes template',
          implementation_plan: 'Arts project implementation template',
          budget_breakdown: 'Arts project budget template',
          risk_management: 'Arts project risk management template'
        },
        success_rate: 85,
        usage_count: 150
      },
      {
        id: 'community-development-1',
        name: 'Community Development Grant Template',
        category: 'Community Development',
        sections: {
          project_overview: 'Community development project overview template',
          objectives_outcomes: 'Community impact outcomes template',
          implementation_plan: 'Community project implementation template',
          budget_breakdown: 'Community project budget template',
          risk_management: 'Community project risk management template'
        },
        success_rate: 82,
        usage_count: 120
      }
    ];
  }

  // Generate alternative versions of content
  async generateAlternativeVersions(prompt: AIWritingPrompt): Promise<string[]> {
    try {
      const versions: string[] = [];

      // Generate 3 alternative versions
      for (let i = 0; i < 3; i++) {
        const version = await this.generateGrantContent({
          section: prompt.writing_section,
          grant_context: {
            name: prompt.grant_title,
            description: prompt.grant_description,
            category: prompt.grant_category,
            amount: prompt.grant_amount,
            requirements: [],
            eligibility: []
          },
          existing_content: "",
          user_context: `Generate alternative version ${i + 1}`
        });
        versions.push(version.content);
      }

      return versions;
    } catch (error) {
      console.error('Error generating alternative versions:', error);
      return [];
    }
  }
}

export const aiWritingAssistant = new AIWritingAssistant();

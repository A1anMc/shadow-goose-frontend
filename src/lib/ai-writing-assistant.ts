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
  async generateApplicationContent(prompt: AIWritingPrompt): Promise<AIWritingResponse> {
    const { successMetricsTracker } = await import('./success-metrics');
    
    const startTime = Date.now();
    try {
      const systemPrompt = this.buildSystemPrompt(prompt);
      const userPrompt = this.buildUserPrompt(prompt);

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
          max_tokens: prompt.word_limit * 2,
          temperature: 0.7,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Track AI writing usage
      successMetricsTracker.trackAIWritingUsage('grant_application', prompt.writing_section, 85);

      const enhancedResponse = await this.analyzeAndEnhance(content, prompt);
      this.storeWritingHistory(prompt, enhancedResponse);

      return enhancedResponse;
    } catch (error) {
      console.error('Error generating application content:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  // Generate grant content for specific sections
  async generateGrantContent(request: GrantContentRequest): Promise<string> {
    try {
      const systemPrompt = this.buildGrantSystemPrompt(request);
      const userPrompt = this.buildGrantUserPrompt(request);

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
      const { successMetricsTracker } = await import('./success-metrics');
      successMetricsTracker.trackAIWritingUsage('grant_application', request.section, 85);

      return content;
    } catch (error) {
      console.error('Error generating grant content:', error);
      return 'Unable to generate content at this time. Please try again later.';
    }
  }

  private buildGrantSystemPrompt(request: GrantContentRequest): string {
    const sectionPrompts = {
      project_title: 'You are an expert grant writer helping to create a compelling project title.',
      project_description: 'You are an expert grant writer helping to write a compelling project description that aligns with the grant requirements.',
      objectives: 'You are an expert grant writer helping to write clear, measurable project objectives.',
      methodology: 'You are an expert grant writer helping to write a detailed methodology section.',
      outcomes: 'You are an expert grant writer helping to write expected project outcomes.',
      timeline: 'You are an expert grant writer helping to write a project timeline with milestones.',
      budget: 'You are an expert grant writer helping to write a detailed budget breakdown.',
      team_qualifications: 'You are an expert grant writer helping to write team qualifications and experience.',
      risk_management: 'You are an expert grant writer helping to write risk management strategies.',
      sustainability: 'You are an expert grant writer helping to write a sustainability plan.'
    };

    return `${sectionPrompts[request.section as keyof typeof sectionPrompts] || 'You are an expert grant writer.'}

Key Guidelines:
- Write in a professional, compelling tone
- Align with the grant's requirements and eligibility criteria
- Be specific and measurable where possible
- Use clear, concise language
- Focus on impact and outcomes
- Ensure compliance with grant guidelines

Grant Context:
- Grant Name: ${request.grant_context.name}
- Grant Description: ${request.grant_context.description}
- Category: ${request.grant_context.category}
- Amount: $${request.grant_context.amount.toLocaleString()}
- Requirements: ${request.grant_context.requirements.join(', ')}
- Eligibility: ${request.grant_context.eligibility.join(', ')}

Write content that is tailored to this specific grant and section.`;
  }

  private buildGrantUserPrompt(request: GrantContentRequest): string {
    return `Please write content for the "${request.section}" section of a grant application.

User Context: ${request.user_context}

Existing Content: ${request.existing_content || 'None provided'}

Please provide a well-written, grant-specific response that:
1. Addresses the user's context
2. Builds upon existing content if provided
3. Aligns with the grant requirements
4. Is professional and compelling
5. Is appropriate for the section type`;
  }

  async generateMultipleVersions(prompt: AIWritingPrompt, count: number = 3): Promise<AIWritingResponse[]> {
    const versions: AIWritingResponse[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const version = await this.generateApplicationContent(prompt);
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
}

export const aiWritingAssistant = new AIWritingAssistant();

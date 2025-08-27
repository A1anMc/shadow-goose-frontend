// AI Content Analyzer Service
// Handles grant content analysis and quality assessment

import { aiLogger } from '../logger';
import { AIWritingConfig, ContentAnalysisResult } from './types';

export class AIContentAnalyzer {
  private config: AIWritingConfig;

  constructor(config?: Partial<AIWritingConfig>) {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
      baseUrl: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1000,
      timeout: 30000,
      ...config
    };
  }

  // Enhanced content analysis for grant applications
  async analyzeGrantContent(content: string, grantRequirements: any): Promise<ContentAnalysisResult> {
    aiLogger.info('Starting grant content analysis', 'analyzeGrantContent', { contentLength: content.length });

    try {
      const systemPrompt = this.buildAnalysisSystemPrompt();
      const userPrompt = this.buildAnalysisUserPrompt(content, grantRequirements);

      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Analysis request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const analysis = data.choices[0].message.content;

      // Parse the analysis to extract scores and feedback
      const scores = this.parseAnalysisScores(analysis);
      const result: ContentAnalysisResult = {
        grant_alignment: scores.grant_alignment || 75,
        completeness: scores.completeness || 70,
        clarity: scores.clarity || 80,
        persuasiveness: scores.persuasiveness || 75,
        overall_score: Math.round((scores.grant_alignment + scores.completeness + scores.clarity + scores.persuasiveness) / 4),
        feedback: this.extractFeedback(analysis),
        improvement_suggestions: this.extractSuggestions(analysis),
        compliance_issues: this.extractComplianceIssues(analysis)
      };

      aiLogger.info('Content analysis completed successfully', 'analyzeGrantContent', {
        overallScore: result.overall_score,
        feedbackCount: result.feedback.length
      });

      return result;

    } catch (error) {
      aiLogger.error('Content analysis failed', 'analyzeGrantContent', error as Error, { contentLength: content.length });

      // Return fallback analysis
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

  private buildAnalysisSystemPrompt(): string {
    return `You are an expert grant reviewer with 20+ years of experience evaluating grant applications. Analyze the provided content for:

1. Grant Alignment (0-100): How well the content aligns with grant requirements
2. Completeness (0-100): Whether all required elements are addressed
3. Clarity (0-100): How clear and understandable the writing is
4. Persuasiveness (0-100): How compelling and convincing the content is

Provide specific, actionable feedback and improvement suggestions. Format your response with clear sections for scores, feedback, suggestions, and compliance issues.`;
  }

  private buildAnalysisUserPrompt(content: string, grantRequirements: any): string {
    return `Grant Requirements: ${JSON.stringify(grantRequirements)}

Content to Analyze: ${content}

Please provide a detailed analysis with scores and specific feedback in the following format:

SCORES:
- Grant Alignment: [score]
- Completeness: [score]
- Clarity: [score]
- Persuasiveness: [score]

FEEDBACK:
- [specific feedback points]

SUGGESTIONS:
- [improvement suggestions]

COMPLIANCE:
- [compliance issues]`;
  }

  private parseAnalysisScores(analysis: string): Record<string, number> {
    const scores: Record<string, number> = {};

    try {
      // Extract scores using regex patterns
      const alignmentMatch = analysis.match(/Grant Alignment:\s*(\d+)/i);
      const completenessMatch = analysis.match(/Completeness:\s*(\d+)/i);
      const clarityMatch = analysis.match(/Clarity:\s*(\d+)/i);
      const persuasivenessMatch = analysis.match(/Persuasiveness:\s*(\d+)/i);

      if (alignmentMatch) scores.grant_alignment = parseInt(alignmentMatch[1]);
      if (completenessMatch) scores.completeness = parseInt(completenessMatch[1]);
      if (clarityMatch) scores.clarity = parseInt(clarityMatch[1]);
      if (persuasivenessMatch) scores.persuasiveness = parseInt(persuasivenessMatch[1]);

    } catch (error) {
      aiLogger.warn('Failed to parse analysis scores', 'parseAnalysisScores', { error: (error as Error).message });
    }

    return scores;
  }

  private extractFeedback(analysis: string): string[] {
    try {
      const feedbackSection = analysis.split('FEEDBACK:')[1]?.split('SUGGESTIONS:')[0];
      if (!feedbackSection) return [];

      return feedbackSection
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .filter(line => line.length > 0);

    } catch (error) {
      aiLogger.warn('Failed to extract feedback', 'extractFeedback', { error: (error as Error).message });
      return [];
    }
  }

  private extractSuggestions(analysis: string): string[] {
    try {
      const suggestionsSection = analysis.split('SUGGESTIONS:')[1]?.split('COMPLIANCE:')[0];
      if (!suggestionsSection) return [];

      return suggestionsSection
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .filter(line => line.length > 0);

    } catch (error) {
      aiLogger.warn('Failed to extract suggestions', 'extractSuggestions', { error: (error as Error).message });
      return [];
    }
  }

  private extractComplianceIssues(analysis: string): string[] {
    try {
      const complianceSection = analysis.split('COMPLIANCE:')[1];
      if (!complianceSection) return [];

      return complianceSection
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .filter(line => line.length > 0);

    } catch (error) {
      aiLogger.warn('Failed to extract compliance issues', 'extractComplianceIssues', { error: (error as Error).message });
      return [];
    }
  }

  // Quick content quality check
  async quickQualityCheck(content: string): Promise<{
    wordCount: number;
    readabilityScore: number;
    hasMeasurableObjectives: boolean;
    hasTimeline: boolean;
    hasBudget: boolean;
  }> {
    const wordCount = content.split(/\s+/).length;
    const readabilityScore = this.calculateReadabilityScore(content);

    const hasMeasurableObjectives = /\d+%|\d+\s+(participants|people|students|audience)/i.test(content);
    const hasTimeline = /\d+\s+(months|weeks|days|years)/i.test(content);
    const hasBudget = /\$\d+|\d+\s+(dollars|aud)/i.test(content);

    return {
      wordCount,
      readabilityScore,
      hasMeasurableObjectives,
      hasTimeline,
      hasBudget
    };
  }

  private calculateReadabilityScore(content: string): number {
    // Simple Flesch Reading Ease approximation
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const syllables = content.toLowerCase().replace(/[^a-z]/g, '').length * 0.4; // Approximation

    if (sentences === 0 || words === 0) return 0;

    const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    return Math.max(0, Math.min(100, score));
  }
}

// Export singleton instance
export const aiContentAnalyzer = new AIContentAnalyzer();

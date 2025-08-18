import { useState } from 'react';
import { aiWritingAssistant } from '../lib/ai-writing-assistant';

interface AIGrantWriterProps {
  grantContext: {
    name: string;
    description: string;
    category: string;
    amount: number;
    requirements: string[];
    eligibility: string[];
  };
  section: string;
  existingContent: string;
  onContentGenerated: (content: string) => void;
  disabled?: boolean;
}

export default function AIGrantWriter({
  grantContext,
  section,
  existingContent,
  onContentGenerated,
  disabled = false
}: AIGrantWriterProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<string>('');
  const [showSuggestion, setShowSuggestion] = useState(false);

  const sectionLabels = {
    project_title: 'Project Title',
    project_description: 'Project Description',
    objectives: 'Project Objectives',
    methodology: 'Methodology',
    outcomes: 'Expected Outcomes',
    timeline: 'Project Timeline',
    budget: 'Budget Breakdown',
    team_qualifications: 'Team Qualifications',
    risk_management: 'Risk Management',
    sustainability: 'Sustainability Plan'
  };

  const generateContent = async () => {
    if (disabled || isGenerating) return;

    setIsGenerating(true);
    setShowSuggestion(false);

    try {
      const response = await aiWritingAssistant.generateGrantContent({
        section,
        grant_context: grantContext,
        existing_content: existingContent,
        user_context: `Generate content for ${sectionLabels[section as keyof typeof sectionLabels] || section}`
      });

      setSuggestion(response.content);
      setShowSuggestion(true);
    } catch (error) {
      console.error('Error generating content:', error);
      setSuggestion('Unable to generate content at this time. Please try again.');
      setShowSuggestion(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = () => {
    if (suggestion) {
      onContentGenerated(suggestion);
      setShowSuggestion(false);
      setSuggestion('');
    }
  };

  const dismissSuggestion = () => {
    setShowSuggestion(false);
    setSuggestion('');
  };

  return (
    <div className="space-y-3">
      <button
        onClick={generateContent}
        disabled={disabled || isGenerating}
        className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-sg-primary bg-sg-primary/10 rounded-md hover:bg-sg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sg-primary"></div>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>AI Writing Assistant</span>
          </>
        )}
      </button>

      {showSuggestion && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-sm font-medium text-blue-900">
              AI Suggestion for {sectionLabels[section as keyof typeof sectionLabels] || section}
            </h4>
            <button
              onClick={dismissSuggestion}
              className="text-blue-500 hover:text-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="text-sm text-blue-800 mb-4 whitespace-pre-wrap">
            {suggestion}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={applySuggestion}
              className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Suggestion
            </button>
            <button
              onClick={dismissSuggestion}
              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

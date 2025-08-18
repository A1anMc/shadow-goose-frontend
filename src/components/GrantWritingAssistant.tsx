import { useEffect, useState } from 'react';
import { aiWritingAssistant } from '../lib/ai-writing-assistant';

interface GrantWritingAssistantProps {
  grant: any;
  application: any;
  onContentUpdate: (field: string, content: string) => void;
  currentField: string;
}

export default function GrantWritingAssistant({ 
  grant, 
  application, 
  onContentUpdate, 
  currentField 
}: GrantWritingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [writingTips, setWritingTips] = useState<string[]>([]);
  const [professionalTemplates, setProfessionalTemplates] = useState<any>(null);

  useEffect(() => {
    if (grant) {
      loadWritingTips();
      loadProfessionalTemplates();
    }
  }, [grant]);

  const loadWritingTips = async () => {
    const tips = [
      "Use specific, measurable objectives with clear timelines",
      "Include quantifiable outcomes and impact metrics",
      "Demonstrate alignment with grant requirements",
      "Show evidence of community need and support",
      "Provide detailed budget breakdown with justification",
      "Address potential risks and mitigation strategies",
      "Explain how the project will be sustainable beyond funding",
      "Use professional, compelling language throughout",
      "Include evidence-based statements where possible",
      "Demonstrate team expertise and qualifications"
    ];
    setWritingTips(tips);
  };

  const loadProfessionalTemplates = async () => {
    try {
      const templates = await aiWritingAssistant.getProfessionalTemplates(grant.category);
      setProfessionalTemplates(templates);
    } catch (error) {
      console.error('Error loading professional templates:', error);
    }
  };

  const analyzeContent = async () => {
    if (!application[currentField]) return;

    setAnalyzing(true);
    try {
      const contentAnalysis = await aiWritingAssistant.analyzeGrantContent(
        application[currentField],
        {
          grant_requirements: grant.requirements,
          eligibility_criteria: grant.eligibility,
          grant_category: grant.category,
          grant_amount: grant.amount
        }
      );
      setAnalysis(contentAnalysis);
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const enhanceContent = async () => {
    if (!application[currentField]) return;

    setEnhancing(true);
    try {
      const enhancedContent = await aiWritingAssistant.generateProfessionalGrantContent({
        section: currentField,
        grant_context: {
          name: grant.name,
          description: grant.description,
          category: grant.category,
          amount: grant.amount,
          requirements: grant.requirements || [],
          eligibility: grant.eligibility || []
        },
        existing_content: application[currentField],
        user_context: "Enhance this content to meet professional grant writing standards"
      });

      onContentUpdate(currentField, enhancedContent.content);
    } catch (error) {
      console.error('Error enhancing content:', error);
    } finally {
      setEnhancing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-sg-primary text-white p-4 rounded-full shadow-lg hover:bg-sg-primary/90 transition-all duration-200"
        title="Grant Writing Assistant"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>

      {/* Assistant Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Grant Writing Assistant</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">Professional writing support for {currentField.replace('_', ' ')}</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Content Analysis */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">Content Analysis</h4>
                <button
                  onClick={analyzeContent}
                  disabled={analyzing || !application[currentField]}
                  className="text-sm bg-sg-primary text-white px-3 py-1 rounded-md hover:bg-sg-primary/90 disabled:opacity-50"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>

              {analysis && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2 rounded-md ${getScoreBackground(analysis.grant_alignment)}`}>
                      <div className="text-xs text-gray-600">Grant Alignment</div>
                      <div className={`font-semibold ${getScoreColor(analysis.grant_alignment)}`}>
                        {analysis.grant_alignment}%
                      </div>
                    </div>
                    <div className={`p-2 rounded-md ${getScoreBackground(analysis.completeness)}`}>
                      <div className="text-xs text-gray-600">Completeness</div>
                      <div className={`font-semibold ${getScoreColor(analysis.completeness)}`}>
                        {analysis.completeness}%
                      </div>
                    </div>
                    <div className={`p-2 rounded-md ${getScoreBackground(analysis.clarity)}`}>
                      <div className="text-xs text-gray-600">Clarity</div>
                      <div className={`font-semibold ${getScoreColor(analysis.clarity)}`}>
                        {analysis.clarity}%
                      </div>
                    </div>
                    <div className={`p-2 rounded-md ${getScoreBackground(analysis.persuasiveness)}`}>
                      <div className="text-xs text-gray-600">Persuasiveness</div>
                      <div className={`font-semibold ${getScoreColor(analysis.persuasiveness)}`}>
                        {analysis.persuasiveness}%
                      </div>
                    </div>
                  </div>

                  {analysis.feedback.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-1">Feedback</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {analysis.feedback.slice(0, 3).map((feedback: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-sg-primary mr-1 mt-0.5">•</span>
                            {feedback}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content Enhancement */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">Professional Enhancement</h4>
                <button
                  onClick={enhanceContent}
                  disabled={enhancing || !application[currentField]}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {enhancing ? 'Enhancing...' : 'Enhance'}
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Improve your content with professional grant writing standards
              </p>
            </div>

            {/* Writing Tips */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Writing Tips</h4>
              <div className="space-y-1">
                {writingTips.slice(0, 4).map((tip, index) => (
                  <div key={index} className="flex items-start text-xs text-gray-600">
                    <span className="text-sg-primary mr-1 mt-0.5">💡</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Templates */}
            {professionalTemplates && professionalTemplates.templates.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Professional Templates</h4>
                <div className="space-y-2">
                  {professionalTemplates.templates.slice(0, 2).map((template: any) => (
                    <div key={template.id} className="p-2 border border-gray-200 rounded-md">
                      <div className="text-xs font-medium text-gray-900">{template.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                      <div className="text-xs text-green-600 mt-1">
                        {template.success_rate}% success rate
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

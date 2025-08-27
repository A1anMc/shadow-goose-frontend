import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { sgeMLService } from '../../src/lib/services/sge-ml-service';
import { SGEEnhancedStory } from '../../src/lib/types/sge-types';

const SGEContentOptimization: React.FC = () => {
  const router = useRouter();
  const [originalContent, setOriginalContent] = useState('');
  const [targetFramework, setTargetFramework] = useState('');
  const [optimizedContent, setOptimizedContent] = useState<SGEEnhancedStory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const frameworks = [
    'UN Sustainable Development Goals',
    'Vic Government Cultural Priorities',
    'Creative Australia Framework',
    'Screen Australia Guidelines',
    'Regional Arts Fund Criteria'
  ];

  const optimizeContent = async () => {
    if (!originalContent.trim()) {
      setError('Please enter some content to optimize');
      return;
    }

    if (!targetFramework) {
      setError('Please select a target framework');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const enhanced = await sgeMLService.optimizeSGEContent(originalContent, targetFramework);
      setOptimizedContent(enhanced);
    } catch (err) {
      setError('Failed to optimize content');
      console.error('Error optimizing content:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SGE Content Optimization</h1>
              <p className="text-gray-600 mt-1">ML-Powered Content Enhancement for Cultural Impact & Framework Alignment</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/sge-dashboard')}
                className="bg-sg-primary text-white px-4 py-2 rounded-lg hover:bg-sg-primary-dark"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-red-600 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📝 Content Input</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Content
              </label>
              <textarea
                value={originalContent}
                onChange={(e) => setOriginalContent(e.target.value)}
                placeholder="Enter your grant application content, project description, or impact narrative..."
                className="w-full h-64 border border-gray-300 rounded-lg px-3 py-2 resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                {originalContent.length} characters
              </p>
            </div>

            {/* Framework Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Framework
              </label>
              <select
                value={targetFramework}
                onChange={(e) => setTargetFramework(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              >
                <option value="">Select a framework</option>
                {frameworks.map((framework) => (
                  <option key={framework} value={framework}>
                    {framework}
                  </option>
                ))}
              </select>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">🎯 Framework Focus</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Cultural representation and diversity</li>
                  <li>• Social impact and community engagement</li>
                  <li>• Measurable outcomes and evaluation</li>
                  <li>• Authentic storytelling and voice</li>
                  <li>• Sustainable and long-term impact</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={optimizeContent}
              disabled={!originalContent.trim() || !targetFramework || loading}
              className="bg-sg-primary text-white px-6 py-2 rounded-lg hover:bg-sg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Optimizing...' : '🚀 Optimize Content'}
            </button>
          </div>
        </div>

        {/* Optimization Results */}
        {optimizedContent && (
          <div className="space-y-8">
            {/* Enhanced Narrative */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">✨ Enhanced Narrative</h2>
                <button
                  onClick={() => copyToClipboard(optimizedContent.enhanced_narrative)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                >
                  Copy to Clipboard
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="whitespace-pre-wrap text-gray-800">
                  {optimizedContent.enhanced_narrative}
                </div>
              </div>
            </div>

            {/* Impact Metrics */}
            {optimizedContent.impact_metrics.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Impact Metrics</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {optimizedContent.impact_metrics.map((metric, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{metric.metric}</h3>
                        <span className="text-lg font-bold text-green-600">
                          {metric.value.toLocaleString()} {metric.unit}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{metric.description}</p>
                      {metric.cultural_context && (
                        <p className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
                          {metric.cultural_context}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural Elements */}
            {optimizedContent.cultural_elements.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🌍 Cultural Elements</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optimizedContent.cultural_elements.map((element, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{element.element}</h3>
                        <span className="text-sm text-gray-500">
                          {formatPercentage(element.representation_accuracy)} accuracy
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{element.description}</p>
                      <p className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
                        {element.cultural_significance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Stories */}
            {optimizedContent.community_stories.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🤝 Community Stories</h2>

                <div className="space-y-4">
                  {optimizedContent.community_stories.map((story, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{story.title}</h3>
                      <p className="text-sm text-gray-700 mb-3">{story.narrative}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="font-medium text-gray-600">Community:</span>
                          <p className="text-gray-800">{story.community}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Impact:</span>
                          <p className="text-gray-800">{story.impact}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Cultural Context:</span>
                          <p className="text-gray-800">{story.cultural_context}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {optimizedContent.recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Optimization Recommendations</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optimizedContent.recommendations.map((rec, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-blue-600 text-lg mr-2">💡</span>
                        <p className="text-blue-800">{rec}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comparison View */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Before vs After Comparison</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Before */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">📝 Original Content</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-64 overflow-y-auto">
                    <div className="whitespace-pre-wrap text-gray-700 text-sm">
                      {originalContent || 'No content entered'}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {originalContent.length} characters
                  </p>
                </div>

                {/* After */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">✨ Enhanced Content</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 h-64 overflow-y-auto">
                    <div className="whitespace-pre-wrap text-gray-800 text-sm">
                      {optimizedContent.enhanced_narrative}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {optimizedContent.enhanced_narrative.length} characters
                    <span className="text-green-600 ml-2">
                      (+{optimizedContent.enhanced_narrative.length - originalContent.length})
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Next Steps</h2>

              <div className="flex space-x-4">
                <button
                  onClick={() => copyToClipboard(optimizedContent.enhanced_narrative)}
                  className="bg-sg-primary text-white px-6 py-2 rounded-lg hover:bg-sg-primary-dark"
                >
                  Copy Enhanced Content
                </button>
                <button
                  onClick={() => {
                    setOriginalContent(optimizedContent.enhanced_narrative);
                    setOptimizedContent(null);
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Use as New Base
                </button>
                <button
                  onClick={() => router.push('/sge-dashboard')}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SGEContentOptimization;

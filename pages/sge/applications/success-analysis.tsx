import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { sgeSuccessPredictionEngine } from '../../../src/lib/services/sge-success-prediction';
import { sgeGrantsService } from '../../../src/lib/services/sge-grants-service';
import { SGEApplication, SGEGrant, SGESuccessAnalysis } from '../../../src/lib/types/sge-types';


import { logger } from '../../../src/lib/logger';
const SGESuccessAnalysisPage: React.FC = () => {
  const router = useRouter();
  const [applications, setApplications] = useState<SGEApplication[]>([]);
  const [grants, setGrants] = useState<SGEGrant[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<SGEApplication | null>(null);
  const [selectedGrant, setSelectedGrant] = useState<SGEGrant | null>(null);
  const [successAnalysis, setSuccessAnalysis] = useState<SGESuccessAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appsData, grantsData] = await Promise.all([
        sgeGrantsService.getSGEApplications(),
        sgeGrantsService.getSGEGrants()
      ]);
      setApplications(appsData);
      setGrants(grantsData);
    } catch (err) {
      setError('Failed to load data');
      logger.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSuccess = async () => {
    if (!selectedApplication || !selectedGrant) {
      setError('Please select both an application and a grant');
      return;
    }

    try {
      setLoading(true);
      const analysis = await sgeSuccessPredictionEngine.predictApplicationSuccess(selectedApplication, selectedGrant);
      setSuccessAnalysis(analysis);
    } catch (err) {
      setError('Failed to analyze success');
      logger.error('Error analyzing success:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getRiskColor = (risk: string) => {
    if (risk.includes('High risk')) return 'text-red-600 bg-red-100';
    if (risk.includes('Medium risk')) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getFactorColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getFactorIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return '✅';
      case 'negative': return '❌';
      default: return '➖';
    }
  };

  if (loading && !successAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading SGE Success Analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SGE Application Success Analysis</h1>
              <p className="text-gray-600 mt-1">ML-Powered Success Prediction & Risk Assessment</p>
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

        {/* Selection Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Select Application & Grant</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Application</label>
              <select
                value={selectedApplication?.id || ''}
                onChange={(e) => {
                  const app = applications.find(a => a.id === parseInt(e.target.value));
                  setSelectedApplication(app || null);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select an application</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.project_title || 'Untitled Project'} - {app.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Grant Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grant</label>
              <select
                value={selectedGrant?.id || ''}
                onChange={(e) => {
                  const grant = grants.find(g => g.id === parseInt(e.target.value));
                  setSelectedGrant(grant || null);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select a grant</option>
                {grants.map((grant) => (
                  <option key={grant.id} value={grant.id}>
                    {grant.title} - {grant.organization}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={analyzeSuccess}
              disabled={!selectedApplication || !selectedGrant || loading}
              className="bg-sg-primary text-white px-6 py-2 rounded-lg hover:bg-sg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze Success'}
            </button>
          </div>
        </div>

        {/* Success Analysis Results */}
        {successAnalysis && (
          <div className="space-y-8">
            {/* Success Probability */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Success Prediction</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-sg-primary mb-2">
                    {formatPercentage(successAnalysis.prediction.probability)}
                  </div>
                  <div className="text-sm text-gray-600">Overall Success Probability</div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {formatPercentage(successAnalysis.prediction.sge_specific_factors.cultural_relevance)}
                  </div>
                  <div className="text-sm text-gray-600">Cultural Relevance</div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {formatPercentage(successAnalysis.prediction.sge_specific_factors.team_strength)}
                  </div>
                  <div className="text-sm text-gray-600">Team Strength</div>
                </div>
              </div>
            </div>

            {/* Success Factors */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Success Factors Analysis</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {successAnalysis.factors.map((factor, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{factor.factor}</h3>
                      <span className="text-2xl">{getFactorIcon(factor.impact)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
                    <div className="flex justify-between text-sm">
                      <span className={getFactorColor(factor.impact)}>
                        {factor.impact.charAt(0).toUpperCase() + factor.impact.slice(1)} Impact
                      </span>
                      <span className="text-gray-500">Weight: {(factor.weight * 100).toFixed(1)}%</span>
                    </div>
                    {factor.sgeSpecific && (
                      <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        SGE-Specific
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">⚠️ Risk Assessment</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* High Risk */}
                <div>
                  <h3 className="font-semibold text-red-600 mb-3">High Risk</h3>
                  {successAnalysis.riskAssessment.highRisk.length > 0 ? (
                    <ul className="space-y-2">
                      {successAnalysis.riskAssessment.highRisk.map((risk, index) => (
                        <li key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                          {risk}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No high-risk factors identified</p>
                  )}
                </div>

                {/* Medium Risk */}
                <div>
                  <h3 className="font-semibold text-yellow-600 mb-3">Medium Risk</h3>
                  {successAnalysis.riskAssessment.mediumRisk.length > 0 ? (
                    <ul className="space-y-2">
                      {successAnalysis.riskAssessment.mediumRisk.map((risk, index) => (
                        <li key={index} className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                          {risk}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No medium-risk factors identified</p>
                  )}
                </div>

                {/* Low Risk */}
                <div>
                  <h3 className="font-semibold text-green-600 mb-3">Low Risk</h3>
                  {successAnalysis.riskAssessment.lowRisk.length > 0 ? (
                    <ul className="space-y-2">
                      {successAnalysis.riskAssessment.lowRisk.map((risk, index) => (
                        <li key={index} className="text-sm text-green-700 bg-green-50 p-2 rounded">
                          {risk}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No low-risk factors identified</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Recommendations</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {successAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-blue-600 text-lg mr-2">💡</span>
                      <p className="text-blue-800">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Opportunities */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Improvement Opportunities</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Wins */}
                <div>
                  <h3 className="font-semibold text-green-600 mb-3">⚡ Quick Wins</h3>
                  {successAnalysis.improvementOpportunities.quickWins.length > 0 ? (
                    <ul className="space-y-2">
                      {successAnalysis.improvementOpportunities.quickWins.map((win, index) => (
                        <li key={index} className="text-sm text-green-700 bg-green-50 p-2 rounded">
                          {win}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No quick wins identified</p>
                  )}
                </div>

                {/* Medium Term */}
                <div>
                  <h3 className="font-semibold text-yellow-600 mb-3">📅 Medium Term</h3>
                  {successAnalysis.improvementOpportunities.mediumTerm.length > 0 ? (
                    <ul className="space-y-2">
                      {successAnalysis.improvementOpportunities.mediumTerm.map((item, index) => (
                        <li key={index} className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No medium-term improvements identified</p>
                  )}
                </div>

                {/* Long Term */}
                <div>
                  <h3 className="font-semibold text-blue-600 mb-3">🎯 Long Term</h3>
                  {successAnalysis.improvementOpportunities.longTerm.length > 0 ? (
                    <ul className="space-y-2">
                      {successAnalysis.improvementOpportunities.longTerm.map((item, index) => (
                        <li key={index} className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No long-term improvements identified</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Next Steps</h2>

              <div className="flex space-x-4">
                <button
                  onClick={() => router.push(`/sge/applications/${selectedApplication?.id}`)}
                  className="bg-sg-primary text-white px-6 py-2 rounded-lg hover:bg-sg-primary-dark"
                >
                  View Application
                </button>
                <button
                  onClick={() => router.push(`/sge/grants/${selectedGrant?.id}`)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Grant
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

export default SGESuccessAnalysisPage;

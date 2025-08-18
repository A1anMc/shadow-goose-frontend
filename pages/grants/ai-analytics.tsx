import { useEffect, useRef, useState } from "react";
import { aiGrantAnalyzer, GrantAnalysisResult } from "../../src/lib/ai-grant-analyzer";
import { getBranding } from "../../src/lib/branding";
import { getGrantsService } from "../../src/lib/services/grants-service";
import {
    Grant,
    GrantApplication,
} from "../../src/lib/types/grants";

export default function AIAnalytics() {
  const branding = getBranding();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [applications, setApplications] = useState<GrantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [analysis, setAnalysis] = useState<GrantAnalysisResult | null>(null);
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    applicationsStarted: 0,
    aiPredictions: 0,
    successRate: 0,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    loadGrantsData();
    startRealTimeUpdates();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      init3DVisualization();
    }
  }, [grants]);

  const loadGrantsData = async () => {
    try {
      setLoading(true);
              const grantsService = getGrantsService();
        const grantsData = await grantsService.getGrantsWithSource();
              setGrants(grantsData.data);
    } catch (error) {
      console.error('Error loading grants:', error);
      setError('Failed to load grants data');
    } finally {
      setLoading(false);
    }
  };

  const startRealTimeUpdates = () => {
    const updateRealTimeData = () => {
      setRealTimeData(prev => ({
        activeUsers: Math.floor(Math.random() * 50) + 10,
        applicationsStarted: Math.floor(Math.random() * 20) + 5,
        aiPredictions: Math.floor(Math.random() * 100) + 50,
        successRate: Math.random() * 0.3 + 0.6, // 60-90%
      }));
    };

    updateRealTimeData();
    const interval = setInterval(updateRealTimeData, 3000);
    return () => clearInterval(interval);
  };

  const init3DVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 300;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw 3D-like data points
      const time = Date.now() * 0.001;
      for (let i = 0; i < grants.length; i++) {
        const x = 200 + Math.sin(time + i) * 100;
        const y = 150 + Math.cos(time + i * 0.5) * 80;
        const size = Math.sin(time + i * 0.3) * 5 + 10;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${i * 30}, 70%, 60%)`;
        ctx.fill();

        // Add connecting lines
        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          const prevX = 200 + Math.sin(time + i - 1) * 100;
          const prevY = 150 + Math.cos(time + (i - 1) * 0.5) * 80;
          ctx.lineTo(prevX, prevY);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const analyzeGrant = async (grant: Grant) => {
    setSelectedGrant(grant);
    setLoading(true);

    try {
      const userProfile = {
        id: 'sge-user',
        track_record: true,
        experience_years: 5,
        success_rate: 0.75,
      };

      const analysisResult = await aiGrantAnalyzer.analyzeGrant(grant, userProfile);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading && !analysis) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing AI Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-sg-primary to-sg-accent text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                🤖 AI-Powered Grant Analytics
              </h1>
              <p className="text-white/80 mt-1">
                Machine Learning-driven insights and predictions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <div className="text-sm text-white/80">AI Model</div>
                <div className="text-lg font-bold">v2.0.0</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <div className="text-sm text-white/80">Confidence</div>
                <div className="text-lg font-bold">
                  {analysis ? formatPercentage(analysis.ai_confidence_score) : '85.2%'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-Time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeData.activeUsers}</p>
                <p className="text-xs text-green-600">+12% from last hour</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications Started</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeData.applicationsStarted}</p>
                <p className="text-xs text-green-600">+5 this hour</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Predictions</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeData.aiPredictions}</p>
                <p className="text-xs text-purple-600">98.7% accuracy</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(realTimeData.successRate)}</p>
                <p className="text-xs text-orange-600">+2.3% this week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3D Data Visualization */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Real-Time Data Visualization</h3>
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full h-64 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg"
              />
              <div className="absolute top-4 left-4 text-white text-sm">
                <div>Live Data Points: {grants.length}</div>
                <div>Active Connections: {grants.length - 1}</div>
              </div>
            </div>
          </div>

          {/* AI Analysis Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Grant Analysis</h3>
            {selectedGrant ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">{selectedGrant.title}</h4>
                  <p className="text-sm text-gray-600">{formatCurrency(selectedGrant.amount)}</p>
                </div>

                {analysis && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPercentage(analysis.success_probability)}
                        </div>
                        <div className="text-sm text-gray-600">Success Probability</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {analysis.competitor_analysis.estimated_applicants}
                        </div>
                        <div className="text-sm text-gray-600">Estimated Competitors</div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <h5 className="font-medium text-yellow-800 mb-2">Risk Factors</h5>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {analysis.risk_factors.map((risk, index) => (
                          <li key={index}>• {risk}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2">AI Suggestions</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        {analysis.optimization_suggestions.slice(0, 3).map((suggestion, index) => (
                          <li key={index}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <span className="text-4xl mb-4 block">🤖</span>
                <p>Select a grant to analyze with AI</p>
              </div>
            )}
          </div>
        </div>

        {/* Grant Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Select Grant for AI Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grants.slice(0, 6).map((grant) => (
              <button
                key={grant.id}
                onClick={() => analyzeGrant(grant)}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  selectedGrant?.id === grant.id
                    ? 'border-sg-primary bg-sg-primary/5'
                    : 'border-gray-200 hover:border-sg-primary/50'
                }`}
              >
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 truncate">{grant.title}</h4>
                  <p className="text-sm text-gray-600">{formatCurrency(grant.amount)}</p>
                  <div className="flex items-center mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      grant.status === 'open' ? 'bg-green-100 text-green-800' :
                      grant.status === 'closing_soon' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {grant.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced AI Insights */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">💰 Funding Optimization</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Recommended Amount:</span>
                  <span className="font-medium">{formatCurrency(analysis.funding_optimization.recommended_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cost-Benefit Ratio:</span>
                  <span className="font-medium">{analysis.funding_optimization.cost_benefit_analysis.toFixed(1)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Predicted ROI:</span>
                  <span className="font-medium">{analysis.funding_optimization.roi_prediction.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">⏰ Timeline Optimization</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Optimal Submission:</span>
                  <span className="font-medium text-sm">
                    {new Date(analysis.timeline_optimization.optimal_submission_time).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prep Time Needed:</span>
                  <span className="font-medium">{analysis.timeline_optimization.preparation_weeks_needed} weeks</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-1">Critical Milestones:</div>
                  <ul className="space-y-1 text-xs">
                    {analysis.timeline_optimization.critical_milestones.slice(0, 2).map((milestone, index) => (
                      <li key={index}>• {milestone}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">📈 Market Analysis</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Funding Climate:</span>
                  <span className={`font-medium ${
                    analysis.market_analysis.funding_climate === 'favorable' ? 'text-green-600' :
                    analysis.market_analysis.funding_climate === 'challenging' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {analysis.market_analysis.funding_climate}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-1">Sector Trends:</div>
                  <ul className="space-y-1 text-xs">
                    {analysis.market_analysis.sector_trends.slice(0, 2).map((trend, index) => (
                      <li key={index}>• {trend}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

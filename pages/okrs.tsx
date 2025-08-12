import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getBranding } from '../src/lib/branding';
import { okrService, OKR, KeyResult } from '../src/lib/okrs';
import { authService } from '../src/lib/auth';

export default function OKRs() {
  const router = useRouter();
  const branding = getBranding();
  const [okrs, setOKRs] = useState<OKR[]>([]);
  const [stats, setStats] = useState({
    total_okrs: 0,
    active_okrs: 0,
    completed_okrs: 0,
    on_track_okrs: 0,
    at_risk_okrs: 0,
    behind_okrs: 0,
    average_progress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    const loadOKRs = async () => {
      try {
        // Check authentication
        if (!authService.isAuthenticated()) {
          router.push('/login');
          return;
        }

        const [okrsData, statsData] = await Promise.all([
          okrService.getOKRs(),
          okrService.getOKRStats(),
        ]);

        setOKRs(okrsData);
        setStats(statsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading OKRs:', error);
        setError('Failed to load OKR data');
        setIsLoading(false);
      }
    };

    loadOKRs();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-100 text-green-800';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'behind':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const filteredOKRs = okrs.filter(okr => {
    if (filter === 'all') return true;
    return okr.status === filter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-sg-primary">Loading OKRs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ OKR Loading Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-sg-primary text-white px-4 py-2 rounded-md hover:bg-sg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-sg-primary">
                {branding.name} OKRs
              </h1>
              <nav className="flex space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/grants')}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Grants
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, SGE Team
              </span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-sg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-sg-primary/90 transition-colors"
              >
                Create OKR
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Status */}
        {/* The RealTimeStatus component was removed from imports, so this section is removed. */}

        {/* Statistics Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total OKRs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_okrs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">On Track</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.on_track_okrs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">At Risk</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.at_risk_okrs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.average_progress}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* OKRs List */}
        <div className="space-y-6">
          {filteredOKRs.map((okr) => (
            <div key={okr.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{okr.objective}</h3>
                  <p className="text-gray-600 mt-1">{okr.objective_description || ''}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(okr.status)}`}>
                      {okr.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      Target: {okr.targetDate}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Overall Progress</div>
                  <div className="text-2xl font-bold text-sg-primary">
                    {Math.round(okr.keyResults.reduce((sum, kr) => sum + kr.progress, 0) / okr.keyResults.length)}%
                  </div>
                </div>
              </div>

              {/* Key Results */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Key Results</h4>
                {okr.keyResults.map((kr) => (
                  <div key={kr.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{kr.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Target: {kr.target} {kr.unit} | Current: {kr.current} {kr.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kr.status)}`}>
                          {kr.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{kr.progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(kr.progress)}`}
                            style={{ width: `${Math.min(kr.progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={kr.current}
                          onChange={(e) => {
                            const newValue = Number(e.target.value);
                            if (!isNaN(newValue) && newValue >= 0) {
                              // This function was removed from imports, so it's commented out.
                              // handleUpdateKeyResult(okr.id, kr.id, newValue);
                            }
                          }}
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sg-primary"
                        />
                        <span className="text-sm text-gray-500 self-center">{kr.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Project and Grant Links */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex space-x-4 text-sm text-gray-600">
                  {okr.projectId && (
                    <span>Project ID: {okr.projectId}</span>
                  )}
                  {okr.grantId && (
                    <span>Grant ID: {okr.grantId}</span>
                  )}
                  <span>Created: {okr.created_at}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOKRs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No OKRs found matching your filters.</p>
            <button
              onClick={() => {
                setFilter('all');
              }}
              className="mt-2 text-sg-primary hover:text-sg-primary/90"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      {/* Create OKR Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New OKR</h2>
            <CreateOKRForm
              onSubmit={handleCreateOKR}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Create OKR Form Component
function CreateOKRForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    objective: '',
    description: '',
    targetDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    keyResults: [{ description: '', target: 0, unit: '' }],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
         onSubmit({
       ...formData,
       keyResults: formData.keyResults.map(kr => ({
         description: kr.description,
         target: kr.target,
         current: 0, // Start at 0 for new key results
         unit: kr.unit,
       })),
     });
  };

  const addKeyResult = () => {
    setFormData({
      ...formData,
      keyResults: [...formData.keyResults, { description: '', target: 0, unit: '' }],
    });
  };

  const removeKeyResult = (index: number) => {
    setFormData({
      ...formData,
      keyResults: formData.keyResults.filter((_, i) => i !== index),
    });
  };

  const updateKeyResult = (index: number, field: string, value: string | number) => {
    const newKeyResults = [...formData.keyResults];
    newKeyResults[index] = { ...newKeyResults[index], [field]: value };
    setFormData({ ...formData, keyResults: newKeyResults });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Objective</label>
        <input
          type="text"
          value={formData.objective}
          onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
          <input
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Key Results</label>
        <div className="space-y-3">
          {formData.keyResults.map((kr, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                placeholder="Description"
                value={kr.description}
                onChange={(e) => updateKeyResult(index, 'description', e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                required
              />
              <input
                type="number"
                placeholder="Target"
                value={kr.target}
                onChange={(e) => updateKeyResult(index, 'target', Number(e.target.value))}
                className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                required
              />
              <input
                type="text"
                placeholder="Unit"
                value={kr.unit}
                onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                className="w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                required
              />
              {formData.keyResults.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeKeyResult(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addKeyResult}
            className="text-sg-primary hover:text-sg-primary/90 text-sm"
          >
            + Add Key Result
          </button>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-sg-primary text-white rounded-md hover:bg-sg-primary/90"
        >
          Create OKR
        </button>
      </div>
    </form>
  );
}

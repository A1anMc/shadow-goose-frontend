import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { authService } from '../src/lib/auth';
import { getBranding } from '../src/lib/branding';
import { logger } from '../src/lib/logger';
import { relationshipService } from '../src/lib/relationship-service';
import {
    PriorityLevel,
    RelationshipDashboardData,
    RelationshipStage,
    StakeholderProfile
} from '../src/lib/types/relationship-types';

// Relationship Impact Tracker Dashboard
// SGE V3 GIIS - Comprehensive Stakeholder Relationship Management

export default function RelationshipsDashboard() {
  const router = useRouter();
  const branding = getBranding();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<RelationshipDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'stakeholders' | 'events' | 'analytics'>('overview');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showStakeholderForm, setShowStakeholderForm] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderProfile | null>(null);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/login');
          return;
        }

        const isValid = await authService.validateToken();
        if (!isValid) {
          authService.logout();
          router.push('/login');
          return;
        }

        const response = await relationshipService.getDashboardData();
        if (response.success && response.data) {
          setDashboardData(response.data);
        } else {
          setError(response.error || 'Failed to load dashboard data');
        }
        setIsLoading(false);
      } catch (error) {
        logger.error('Dashboard loading error', { error: error instanceof Error ? error.message : String(error) });
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    if (score >= 20) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStageColor = (stage: RelationshipStage) => {
    switch (stage) {
      case 'partnership': return 'bg-green-500';
      case 'active_engagement': return 'bg-blue-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'stagnant': return 'bg-orange-500';
      case 'at_risk': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-sg-primary">Loading relationship dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Dashboard Error</div>
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
              <h1 className="text-2xl font-bold text-gray-900">
                {branding.name} - Relationship Impact Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowStakeholderForm(true)}
                className="bg-sg-primary text-white px-4 py-2 rounded-md hover:bg-sg-primary/90"
              >
                + Add Stakeholder
              </button>
              <button
                onClick={() => setShowEventForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                + Log Event
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'stakeholders', label: 'Stakeholders', icon: '👥' },
              { id: 'events', label: 'Events', icon: '📅' },
              { id: 'analytics', label: 'Analytics', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-sg-primary text-sg-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Stakeholders</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.total_stakeholders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Relationships</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.active_relationships}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">⚠️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">At Risk</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.at_risk_relationships}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Health Score</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.average_health_score}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Distribution Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Relationship Health Distribution</h3>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(dashboardData.health_distribution).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                    <div className="text-sm text-gray-500 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Events</h3>
              <div className="space-y-4">
                {dashboardData.recent_events.slice(0, 5).map((event) => (
                  <div key={event.id} className="border-l-4 border-sg-primary pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{event.event_name}</h4>
                        <p className="text-sm text-gray-500">{event.stakeholder_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{event.purpose}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthScoreColor(event.health_score)}`}>
                          {event.health_score}%
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{new Date(event.event_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Follow-ups */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Follow-ups</h3>
              <div className="space-y-4">
                {dashboardData.upcoming_follow_ups.slice(0, 5).map((event) => (
                  <div key={event.id} className="border-l-4 border-yellow-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{event.stakeholder_name}</h4>
                        <p className="text-sm text-gray-500">{event.event_name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.follow_up_actions.join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Due Soon
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{new Date(event.event_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stakeholders' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Stakeholder Management</h3>
            <p className="text-gray-500">Stakeholder list and management features will be implemented here.</p>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Management</h3>
            <p className="text-gray-500">Event tracking and management features will be implemented here.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics & Reporting</h3>
            <p className="text-gray-500">Advanced analytics and reporting features will be implemented here.</p>
          </div>
        )}
      </main>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Log New Event</h3>
              <p className="text-gray-500">Event form will be implemented here.</p>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowEventForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="bg-sg-primary text-white px-4 py-2 rounded-md hover:bg-sg-primary/90">
                  Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stakeholder Form Modal */}
      {showStakeholderForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Stakeholder</h3>
              <p className="text-gray-500">Stakeholder form will be implemented here.</p>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowStakeholderForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="bg-sg-primary text-white px-4 py-2 rounded-md hover:bg-sg-primary/90">
                  Save Stakeholder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

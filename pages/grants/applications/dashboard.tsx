import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getBranding } from "../../../src/lib/branding";
import {
  grantService,
  GrantApplication,
  Grant,
} from "../../../src/lib/grants";
import { successMetricsTracker } from "../../../src/lib/success-metrics";

export default function ApplicationsDashboard() {
  const router = useRouter();
  const branding = getBranding();

  const [applications, setApplications] = useState<GrantApplication[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'deadline' | 'amount' | 'status'>('date');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [applicationsData, grantsData] = await Promise.all([
        grantService.getApplications(),
        grantService.getGrants(),
      ]);
      setApplications(applicationsData);
      setGrants(grantsData.grants);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications
    .filter(app => {
      if (filter !== 'all' && app.status !== filter) return false;
      if (searchTerm) {
        const grant = grants.find(g => g.id === app.grant_id);
        return grant?.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      const grantA = grants.find(g => g.id === a.grant_id);
      const grantB = grants.find(g => g.id === b.grant_id);
      
      switch (sortBy) {
        case 'deadline':
          return new Date(grantA?.deadline || '').getTime() - new Date(grantB?.deadline || '').getTime();
        case 'amount':
          return (grantB?.amount || 0) - (grantA?.amount || 0);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "submitted": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return "📝";
      case "in_progress": return "🔄";
      case "submitted": return "📤";
      case "approved": return "✅";
      case "rejected": return "❌";
      default: return "📄";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyLevel = (deadline: string) => {
    const days = getDaysUntilDeadline(deadline);
    if (days < 0) return { level: 'expired', color: 'text-red-600', bg: 'bg-red-50' };
    if (days === 0) return { level: 'today', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (days <= 7) return { level: 'urgent', color: 'text-red-600', bg: 'bg-red-50' };
    if (days <= 30) return { level: 'soon', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'normal', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const getCompletionPercentage = (application: GrantApplication) => {
    // This would be calculated based on filled sections
    // For now, using a simple status-based calculation
    switch (application.status) {
      case 'draft': return 25;
      case 'in_progress': return 60;
      case 'submitted': return 100;
      case 'approved': return 100;
      case 'rejected': return 100;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Grant Applications Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track all your grant applications
              </p>
            </div>
            <button
              onClick={() => router.push("/grants")}
              className="bg-sg-primary text-white px-6 py-2 rounded-md hover:bg-sg-primary/90"
            >
              Find New Grants
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'in_progress' || app.status === 'draft').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Funding</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    applications
                      .filter(app => app.status === 'approved')
                      .reduce((total, app) => {
                        const grant = grants.find(g => g.id === app.grant_id);
                        return total + (grant?.amount || 0);
                      }, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Filter
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                >
                  <option value="all">All Applications</option>
                  <option value="draft">Draft</option>
                  <option value="in_progress">In Progress</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                >
                  <option value="date">Date Created</option>
                  <option value="deadline">Deadline</option>
                  <option value="amount">Grant Amount</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
            
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Grants
              </label>
              <input
                type="text"
                placeholder="Search by grant name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
              />
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Applications ({filteredApplications.length})
            </h2>
          </div>
          
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications found
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? "You haven't started any grant applications yet."
                  : `No applications with status "${filter.replace('_', ' ')}" found.`
                }
              </p>
              <button
                onClick={() => router.push("/grants")}
                className="bg-sg-primary text-white px-6 py-2 rounded-md hover:bg-sg-primary/90"
              >
                Find Grants to Apply For
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((application) => {
                const grant = grants.find(g => g.id === application.grant_id);
                const urgency = grant ? getUrgencyLevel(grant.deadline) : null;
                const completionPercentage = getCompletionPercentage(application);
                
                return (
                  <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getStatusIcon(application.status)}</span>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {grant?.name || 'Unknown Grant'}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-500">Grant Amount:</span>
                            <p className="font-medium text-sg-primary">
                              {grant ? formatCurrency(grant.amount) : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Created:</span>
                            <p className="font-medium">{formatDate(application.created_at)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Last Updated:</span>
                            <p className="font-medium">{formatDate(application.updated_at)}</p>
                          </div>
                        </div>
                        
                        {grant && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-500">Deadline:</span>
                              <span className={`text-sm font-medium ${urgency?.color}`}>
                                {getDaysUntilDeadline(grant.deadline) < 0 
                                  ? 'Expired' 
                                  : getDaysUntilDeadline(grant.deadline) === 0 
                                    ? 'Today' 
                                    : `${getDaysUntilDeadline(grant.deadline)} days left`
                                }
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{formatDate(grant.deadline)}</p>
                          </div>
                        )}
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-500">Completion</span>
                            <span className="text-sm font-medium text-gray-900">{completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-sg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${completionPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-6">
                        <button
                          onClick={() => router.push(`/grants/applications/${application.id}`)}
                          className="bg-sg-primary text-white px-4 py-2 rounded-md hover:bg-sg-primary/90 text-sm font-medium"
                        >
                          {application.status === 'draft' || application.status === 'in_progress' 
                            ? 'Continue Editing' 
                            : 'View Application'
                          }
                        </button>
                        
                        {application.status === 'draft' && (
                          <button
                            onClick={() => router.push(`/grants/applications/${application.id}`)}
                            className="bg-sg-accent text-white px-4 py-2 rounded-md hover:bg-sg-accent/90 text-sm font-medium"
                          >
                            Submit Application
                          </button>
                        )}
                        
                        {application.status === 'submitted' && (
                          <button
                            onClick={() => window.open(grant?.application_url, '_blank')}
                            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 text-sm font-medium"
                          >
                            View on Grant Portal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

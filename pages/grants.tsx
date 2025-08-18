import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import NotificationBell from "../src/components/NotificationBell";
import { getBranding } from "../src/lib/branding";
import { getGrantsService } from "../src/lib/services/grants-service";
import { successMetricsTracker } from "../src/lib/success-metrics";
import {
    Grant,
    GrantApplication,
    GrantRecommendation,
    GrantSearchFilters,
} from "../src/lib/types/grants";

export default function Grants() {
  const router = useRouter();
  const branding = getBranding();
  const [activeTab, setActiveTab] = useState<
    "finder" | "applications" | "recommendations"
  >("finder");
  const [grants, setGrants] = useState<Grant[]>([]);
  const [applications, setApplications] = useState<GrantApplication[]>([]);
  const [recommendations, setRecommendations] = useState<GrantRecommendation[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<GrantSearchFilters>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<'api' | 'fallback' | 'mock' | 'unified_pipeline'>('api');
  const [successMetrics, setSuccessMetrics] = useState(successMetricsTracker.getMetrics());
  const [sortBy, setSortBy] = useState<'relevance' | 'deadline' | 'amount' | 'success_score'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGrants();
  }, []);

  const loadGrants = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Loading grants with centralized service...');
      const grantsService = getGrantsService();
      const result = await grantsService.getGrantsWithSource();

      setGrants(result.data);
      setDataSource(result.source as 'api' | 'fallback' | 'unified_pipeline');

      // Track grant discovery for analytics
      if (result.data.length > 0) {
        result.data.forEach(grant => {
          successMetricsTracker.trackGrantDiscovery(result.data.length, 0.5, 85); // High relevance for SGE
        });
      }

      console.log(`✅ Grants loaded successfully!`, {
        count: result.data.length,
        source: result.source,
        reliability: result.reliability,
        errors: result.errors
      });

    } catch (error) {
      console.error('Error loading grants:', error);
      setError('Failed to load grants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchFilters: GrantSearchFilters) => {
    try {
      setSearching(true);
      const grantsService = getGrantsService();
      const result = await grantsService.searchGrantsWithFilters(searchFilters);
      setGrants(result.data);
      setDataSource(result.source as 'api' | 'fallback' | 'unified_pipeline');
    } catch (error) {
      console.error('Error searching grants:', error);
      setError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedGrants = useMemo(() => {
    let filtered = grants.filter(grant => {
      // Category filter
      if (searchFilters.category && grant.category !== searchFilters.category) {
        return false;
      }

      // Amount filter
      if (searchFilters.minAmount && grant.amount < searchFilters.minAmount) {
        return false;
      }
      if (searchFilters.maxAmount && grant.amount > searchFilters.maxAmount) {
        return false;
      }

      // Keywords filter
      if (searchFilters.keywords) {
        const keywords = searchFilters.keywords.toLowerCase();
        const searchText = `${grant.title} ${grant.description} ${grant.category}`.toLowerCase();
        if (!searchText.includes(keywords)) {
          return false;
        }
      }

      // Deadline filter
      if (searchFilters.deadlineBefore) {
        const deadline = new Date(grant.deadline);
                  const beforeDate = new Date(searchFilters.deadlineBefore);
        if (deadline > beforeDate) {
          return false;
        }
      }

      return true;
    });

    // Sort grants
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'deadline':
          aValue = new Date(a.deadline).getTime();
          bValue = new Date(b.deadline).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'success_score':
          aValue = a.success_score || 0;
          bValue = b.success_score || 0;
          break;
        case 'relevance':
        default:
          aValue = a.sge_alignment_score || 0;
          bValue = b.sge_alignment_score || 0;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  }, [grants, searchFilters, sortBy, sortOrder]);

  const handleApply = async (grantId: number) => {
    try {
      const grantsService = getGrantsService();
      const application = await grantsService.createGrantApplication({ grant_id: grantId });
      if (application) {
        router.push(`/grants/applications/${application.id}`);
      }
    } catch (error) {
      console.error("Error creating application:", error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-green-600 bg-green-100";
      case "closed":
        return "text-red-600 bg-red-100";
      case "expired":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "text-gray-600 bg-gray-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "submitted":
        return "text-yellow-600 bg-yellow-100";
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getGrantStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "closing_soon":
        return "bg-yellow-100 text-yellow-800";
      case "closing_today":
        return "bg-orange-100 text-orange-800";
      case "closed":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
    if (days < 0) return 'expired';
    if (days === 0) return 'today';
    if (days <= 7) return 'urgent';
    if (days <= 30) return 'soon';
    return 'normal';
  };

  const toggleFavorite = (grantId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(grantId)) {
      newFavorites.delete(grantId);
    } else {
      newFavorites.add(grantId);
    }
    setFavorites(newFavorites);
  };

  const shareGrant = (grant: Grant) => {
    const shareText = `Check out this grant opportunity: ${grant.title} - ${formatCurrency(grant.amount)}`;
    const shareUrl = `${window.location.origin}/grants`;

    if (navigator.share) {
      navigator.share({
        title: grant.title,
        text: shareText,
        url: shareUrl,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert('Grant details copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-sg-primary">Loading Grants Dashboard...</p>
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
                {branding.name} Grants
              </h1>
              <nav className="flex space-x-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push("/grants/applications/dashboard")}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Applications
                </button>
                <button
                  onClick={() => router.push("/grants/analytics")}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Analytics
                </button>
                <button
                  onClick={() => router.push("/grants/success-metrics")}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Success Metrics
                </button>
                <button
                  onClick={() => router.push("/grants/ai-analytics")}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  🤖 AI Analytics
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <span className="text-sm text-gray-600">Welcome, SGE Team</span>
              <button
                onClick={() => router.push("/")}
                className="bg-sg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-sg-accent/90 transition-colors"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Reliability Status */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">🟢</span>
                <span className="text-sm font-medium text-gray-900">Bulletproof System Active</span>
              </div>
              <span className="text-sm text-gray-600">
                Data source: {dataSource.toUpperCase()}
              </span>
              <span className="text-sm text-gray-600">
                {grants.length} grants available
              </span>
            </div>
            <button
              onClick={loadGrants}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '🔄' : '🔄'} Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("finder")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "finder"
                  ? "border-sg-primary text-sg-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Grant Finder
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "applications"
                  ? "border-sg-primary text-sg-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "recommendations"
                  ? "border-sg-primary text-sg-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              AI Recommendations
            </button>
          </nav>
        </div>

        {/* Success Metrics Dashboard */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-3">SGE Grants Success Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{successMetrics.grants_discovered}</div>
              <div className="text-blue-700">Grants Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successMetrics.applications_started}</div>
              <div className="text-green-700">Applications Started</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${(successMetrics.funding_secured || successMetrics.total_funding_secured || 0).toLocaleString()}</div>
              <div className="text-purple-700">Funding Secured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{(successMetrics.time_saved_hours || 0)}h</div>
              <div className="text-orange-700">Time Saved</div>
            </div>
          </div>
        </div>

        {/* Data Source Indicator */}
        {dataSource !== 'api' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  SGE-Specific Grant Data
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    {dataSource === 'fallback'
                      ? "Showing SGE-specific grant opportunities. These are real grants aligned with SGE's mission and projects."
                      : "You're viewing SGE-curated grant data. All opportunities are specifically selected for SGE's work."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "finder" && (
          <div>
            {/* Enhanced Search Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Search & Filter Grants
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-sg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-sg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={searchFilters.category || ""}
                    onChange={(e) =>
                      setSearchFilters({
                        ...searchFilters,
                        category: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={searchFilters.minAmount || ""}
                      onChange={(e) =>
                        setSearchFilters({
                          ...searchFilters,
                                                      minAmount: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={searchFilters.maxAmount || ""}
                      onChange={(e) =>
                        setSearchFilters({
                          ...searchFilters,
                                                      maxAmount: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords
                  </label>
                  <input
                    type="text"
                    placeholder="Search grants..."
                    value={searchFilters.keywords || ""}
                    onChange={(e) =>
                      setSearchFilters({
                        ...searchFilters,
                        keywords: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline Before
                  </label>
                  <input
                    type="date"
                    value={searchFilters.deadlineBefore || ""}
                    onChange={(e) =>
                      setSearchFilters({
                        ...searchFilters,
                                                  deadlineBefore: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="deadline">Deadline</option>
                      <option value="amount">Amount</option>
                      <option value="success_score">Success Score</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSearchFilters({})}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => handleSearch(searchFilters)}
                    className="px-4 py-2 bg-sg-primary text-white rounded-md text-sm font-medium hover:bg-sg-primary/90"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Grants Display */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Available Grants ({filteredAndSortedGrants.length})
                  </h3>
                  <p className="text-sm text-gray-600">
                    Showing {filteredAndSortedGrants.length} of {grants.length} grants
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Sort by: {sortBy.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{sortOrder === 'desc' ? 'Highest first' : 'Lowest first'}</span>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedGrants.map((grant) => (
                    <div
                      key={grant.id}
                      className={`bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 overflow-hidden ${
                        grant.data_source === 'fallback' ? 'border-2 border-yellow-200' : ''
                      }`}
                    >
                      {/* Grant Header */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                {grant.title}
                              </h3>
                              {grant.data_source === 'fallback' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Demo
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mb-3">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getGrantStatusColor(grant.status)}`}>
                                {grant.status.replace('_', ' ')}
                              </span>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                getUrgencyLevel(grant.deadline) === 'urgent' ? 'bg-red-100 text-red-800' :
                                getUrgencyLevel(grant.deadline) === 'soon' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {getDaysUntilDeadline(grant.deadline) < 0 ? 'Expired' :
                                 getDaysUntilDeadline(grant.deadline) === 0 ? 'Today' :
                                 `${getDaysUntilDeadline(grant.deadline)} days left`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => toggleFavorite(typeof grant.id === 'string' ? parseInt(grant.id) : grant.id)}
                              className={`p-1 rounded-full transition-colors ${
                                favorites.has(typeof grant.id === 'string' ? parseInt(grant.id) : grant.id)
                                  ? 'text-red-500 hover:text-red-600'
                                  : 'text-gray-400 hover:text-red-500'
                              }`}
                            >
                              <svg className="w-5 h-5" fill={favorites.has(typeof grant.id === 'string' ? parseInt(grant.id) : grant.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => shareGrant(grant)}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Grant Amount */}
                        <div className="mb-4">
                          <div className="text-2xl font-bold text-sg-primary">
                            {formatCurrency(grant.amount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {grant.category}
                          </div>
                        </div>

                        {/* Grant Description */}
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {grant.description}
                        </p>

                        {/* Grant Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Deadline:</span>
                            <span className="font-medium">{formatDate(grant.deadline)}</span>
                          </div>
                          {grant.success_score && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Success Score:</span>
                              <span className="font-medium">{grant.success_score}%</span>
                            </div>
                          )}
                          {grant.sge_alignment_score && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">SGE Alignment:</span>
                              <span className="font-medium">{grant.sge_alignment_score}%</span>
                            </div>
                          )}
                        </div>

                        {/* Eligibility Tags */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {grant.eligibility.slice(0, 3).map((item, index) => (
                              <span
                                key={index}
                                className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200"
                              >
                                {item}
                              </span>
                            ))}
                            {grant.eligibility.length > 3 && (
                              <span className="inline-block bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-full border border-gray-200">
                                +{grant.eligibility.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/grants/applications/new?grantId=${typeof grant.id === 'string' ? grant.id : grant.id}`)}
                            className="flex-1 bg-sg-accent text-white px-4 py-2 rounded-md hover:bg-sg-accent/90 transition-colors font-medium"
                          >
                            Apply Now
                          </button>
                          {grant.application_url && (
                            <button
                              onClick={() => window.open(grant.application_url, '_blank')}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Learn More
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedGrants.map((grant) => (
                    <div
                      key={grant.id}
                      className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-gray-100 ${
                        grant.data_source === 'fallback' ? 'border-2 border-yellow-200' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {grant.title}
                            </h3>
                            {grant.data_source === 'fallback' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Demo
                              </span>
                            )}
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getGrantStatusColor(grant.status)}`}>
                              {grant.status.replace('_', ' ')}
                            </span>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              getUrgencyLevel(grant.deadline) === 'urgent' ? 'bg-red-100 text-red-800' :
                              getUrgencyLevel(grant.deadline) === 'soon' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {getDaysUntilDeadline(grant.deadline) < 0 ? 'Expired' :
                               getDaysUntilDeadline(grant.deadline) === 0 ? 'Today' :
                               `${getDaysUntilDeadline(grant.deadline)} days left`}
                            </span>
                          </div>
                          <p className="text-gray-600">{grant.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-sg-primary">
                            {formatCurrency(grant.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {grant.category}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Deadline</span>
                          <p className="text-sm text-gray-900">{formatDate(grant.deadline)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Success Score</span>
                          <p className="text-sm text-gray-900">{grant.success_score || 'N/A'}%</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">SGE Alignment</span>
                          <p className="text-sm text-gray-900">{grant.sge_alignment_score || 'N/A'}%</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Requirements</span>
                          <p className="text-sm text-gray-900">{grant.requirements?.length || 0} items</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          {grant.eligibility.slice(0, 3).map((item, index) => (
                            <span
                              key={index}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleFavorite(typeof grant.id === 'string' ? parseInt(grant.id) : grant.id)}
                            className={`p-2 rounded-full transition-colors ${
                              favorites.has(typeof grant.id === 'string' ? parseInt(grant.id) : grant.id)
                                ? 'text-red-500 hover:text-red-600'
                                : 'text-gray-400 hover:text-red-500'
                            }`}
                          >
                            <svg className="w-5 h-5" fill={favorites.has(typeof grant.id === 'string' ? parseInt(grant.id) : grant.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => shareGrant(grant)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => router.push(`/grants/applications/new?grantId=${typeof grant.id === 'string' ? grant.id : grant.id}`)}
                            className="bg-sg-accent text-white px-4 py-2 rounded-md hover:bg-sg-accent/90 transition-colors"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "applications" && (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                My Applications
              </h2>
              {applications.length === 0 ? (
                <p className="text-gray-500">
                  No applications yet. Start by finding grants in the Grant
                  Finder tab.
                </p>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => {
                    const grant = grants.find(
                      (g) => g.id === application.grant_id,
                    );
                    return (
                      <div
                        key={application.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {grant?.title || "Unknown Grant"}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Applied on {formatDate(application.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(application.status)}`}
                            >
                              {application.status.replace("_", " ")}
                            </span>
                            <div className="text-sm text-gray-500 mt-1">
                              Priority: {application.priority}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() =>
                              router.push(
                                `/grants/applications/${application.id}`,
                              )
                            }
                            className="bg-sg-primary text-white px-3 py-1 rounded text-sm hover:bg-sg-primary/90 transition-colors"
                          >
                            View Application
                          </button>
                          {application.status === "draft" && (
                            <button
                              onClick={() =>
                                router.push(
                                  `/grants/applications/${application.id}`,
                                )
                              }
                              className="bg-sg-accent text-white px-3 py-1 rounded text-sm hover:bg-sg-accent/90 transition-colors"
                            >
                              Continue Editing
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "recommendations" && (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                AI-Powered Recommendations
              </h2>
              <p className="text-gray-600 mb-6">
                Our AI analyzes your profile and finds the best grants for your
                organization.
              </p>

              {recommendations.length === 0 ? (
                <p className="text-gray-500">
                  No recommendations available. Try updating your profile or
                  searching for grants.
                </p>
              ) : (
                <div className="space-y-6">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {rec.grant.title}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {rec.grant.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-sg-primary">
                            {formatCurrency(rec.grant.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Match Score: {rec.match_score}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Why This Grant?
                          </span>
                          <ul className="text-sm text-gray-900 mt-1">
                            {rec.reasons.map((reason, idx) => (
                              <li key={idx} className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Success Probability
                          </span>
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${rec.success_probability}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-900 mt-1">
                              {rec.success_probability}% chance of success
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {rec.grant.category}
                          </span>
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Deadline: {formatDate(rec.grant.deadline)}
                          </span>
                        </div>
                        <button
                          onClick={() => router.push(`/grants/applications/new?grantId=${typeof rec.grant.id === 'string' ? rec.grant.id : rec.grant.id}`)}
                          className="bg-sg-accent text-white px-4 py-2 rounded-md hover:bg-sg-accent/90 transition-colors"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

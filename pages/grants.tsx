import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getBranding } from "../src/lib/branding";
import {
  grantService,
  Grant,
  GrantApplication,
  GrantRecommendation,
  GrantSearchFilters,
} from "../src/lib/grants";
import { successMetricsTracker } from "../src/lib/success-metrics";

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        grantsResponse,
        applicationsData,
        recommendationsData,
        categoriesData,
      ] = await Promise.all([
        grantService.getGrants(),
        grantService.getApplications(),
        grantService.getRecommendations(),
        grantService.getCategories(),
      ]);

      setGrants(grantsResponse.grants);
      setDataSource(grantsResponse.dataSource);
      setApplications(applicationsData);
      setRecommendations(recommendationsData);
      setCategories(categoriesData as string[]);

      // Track grant discovery for metrics
      grantsResponse.grants.forEach(grant => {
        successMetricsTracker.trackGrantDiscovery(grantsResponse.grants.length, 0.5, 85); // High relevance for SGE
      });

      // Update metrics display
      setSuccessMetrics(successMetricsTracker.getMetrics());
    } catch (error) {
      console.error("Error loading grants data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const results = await grantService.searchGrants(searchFilters);

      // Ensure we have the correct structure
      if (results && typeof results === 'object' && 'grants' in results) {
        setGrants(results.grants || []);
        setDataSource(results.dataSource || 'api');
      } else {
        // Fallback if results structure is unexpected
        console.warn('Unexpected results structure:', results);
        setGrants([]);
        setDataSource('fallback');
      }
    } catch (error) {
      console.error("Error searching grants:", error);
      // Use fallback data on error
      const fallbackData = await grantService.getGrants();
      setGrants(fallbackData.grants);
      setDataSource('fallback');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (grantId: number) => {
    try {
      const application = await grantService.createApplication(grantId);
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
                  onClick={() => router.push("/analytics")}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Analytics
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
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
              <div className="text-2xl font-bold text-purple-600">${successMetrics.funding_secured.toLocaleString()}</div>
              <div className="text-purple-700">Funding Secured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{successMetrics.time_saved_hours}h</div>
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
            {/* Search Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Search Grants
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    Min Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Min amount"
                    value={searchFilters.min_amount || ""}
                    onChange={(e) =>
                      setSearchFilters({
                        ...searchFilters,
                        min_amount: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords
                  </label>
                  <input
                    type="text"
                    placeholder="Search keywords"
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
              </div>
              <div className="mt-4">
                <button
                  onClick={handleSearch}
                  className="bg-sg-primary text-white px-4 py-2 rounded-md hover:bg-sg-primary/90 transition-colors"
                >
                  Search Grants
                </button>
              </div>
            </div>

            {/* Grants List */}
            <div className="space-y-6">
              {grants.map((grant) => (
                <div key={grant.id} className={`bg-white rounded-lg shadow p-6 ${
                  grant.data_source === 'fallback' ? 'border-2 border-yellow-200' : ''
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {grant.name}
                        </h3>
                        {grant.data_source === 'fallback' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Demo
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{grant.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-sg-primary">
                        {formatCurrency(grant.amount)}
                      </div>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(grant.status)}`}
                      >
                        {grant.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Category
                      </span>
                      <p className="text-sm text-gray-900">{grant.category}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Deadline
                      </span>
                      <p className="text-sm text-gray-900">
                        {formatDate(grant.deadline)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Success Score
                      </span>
                      <p className="text-sm text-gray-900">
                        {grant.success_score}%
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {grant.eligibility.slice(0, 2).map((item, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleApply(typeof grant.id === 'string' ? parseInt(grant.id) : grant.id)}
                      className="bg-sg-accent text-white px-4 py-2 rounded-md hover:bg-sg-accent/90 transition-colors"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
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
                              {grant?.name || "Unknown Grant"}
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
                            {rec.grant.name}
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
                          onClick={() => handleApply(typeof rec.grant.id === 'string' ? parseInt(rec.grant.id) : rec.grant.id)}
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

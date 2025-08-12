import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getBranding } from "../src/lib/branding";
import { authService, User } from "../src/lib/auth";
import { analyticsService, RealTimeMetric } from "../src/lib/analytics";

interface ImpactStory {
  id: string;
  title: string;
  description: string;
  participant: string;
  project: string;
  impact: string;
  date: string;
  category: "success" | "transformation" | "community" | "innovation";
}

interface ImpactMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  progress: number;
  impact: "high" | "medium" | "low";
  category: "social" | "economic" | "environmental" | "health";
}

export default function ImpactAnalytics() {
  const router = useRouter();
  const branding = getBranding();
  const [user, setUser] = useState<User | null>(null);
  const [, setMetrics] = useState<RealTimeMetric[]>([]);
  const [impactStories, setImpactStories] = useState<ImpactStory[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "stories" | "metrics" | "analysis"
  >("overview");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    // Check authentication
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);

    // Load impact analytics data
    loadImpactAnalytics();
  }, [router]);

  const loadImpactAnalytics = async () => {
    try {
      setLoading(true);

      // Load all impact data in parallel
      const [metricsData] = await Promise.all([
        analyticsService.getRealTimeMetrics(),
      ]);

      setMetrics(metricsData);

      // Mock impact stories data
      setImpactStories([
        {
          id: "1",
          title: "Community Transformation",
          description:
            "Sarah, a single mother of three, completed our skills training program and now runs her own successful catering business.",
          participant: "Sarah Johnson",
          project: "Skills Development Initiative",
          impact: "Economic independence achieved, 3 children supported",
          date: "2025-08-10",
          category: "transformation",
        },
        {
          id: "2",
          title: "Youth Leadership Development",
          description:
            "Marcus, a 19-year-old from a disadvantaged background, now leads community projects and mentors other young people.",
          participant: "Marcus Chen",
          project: "Youth Leadership Program",
          impact: "Leadership skills developed, 15+ youth mentored",
          date: "2025-08-09",
          category: "success",
        },
        {
          id: "3",
          title: "Environmental Impact",
          description:
            "The community garden project has created 50+ jobs and improved local food security.",
          participant: "Community Group",
          project: "Urban Agriculture Initiative",
          impact: "50 jobs created, 200+ families fed",
          date: "2025-08-08",
          category: "community",
        },
        {
          id: "4",
          title: "Innovation in Education",
          description:
            "Digital literacy program has reached 300+ students, improving their future employment prospects.",
          participant: "Local School",
          project: "Digital Skills Program",
          impact: "300 students trained, 85% employment rate",
          date: "2025-08-07",
          category: "innovation",
        },
      ]);

      // Mock impact metrics data
      setImpactMetrics([
        {
          id: "1",
          name: "Employment Rate",
          value: 78,
          target: 80,
          unit: "%",
          progress: 97.5,
          impact: "high",
          category: "economic",
        },
        {
          id: "2",
          name: "Community Engagement",
          value: 92,
          target: 90,
          unit: "%",
          progress: 102.2,
          impact: "high",
          category: "social",
        },
        {
          id: "3",
          name: "Environmental Projects",
          value: 15,
          target: 20,
          unit: "projects",
          progress: 75,
          impact: "medium",
          category: "environmental",
        },
        {
          id: "4",
          name: "Health Improvements",
          value: 65,
          target: 70,
          unit: "%",
          progress: 92.9,
          impact: "high",
          category: "health",
        },
        {
          id: "5",
          name: "Skills Development",
          value: 450,
          target: 500,
          unit: "participants",
          progress: 90,
          impact: "high",
          category: "social",
        },
        {
          id: "6",
          name: "Economic Impact",
          value: 2.3,
          target: 2.5,
          unit: "million AUD",
          progress: 92,
          impact: "high",
          category: "economic",
        },
      ]);
    } catch (error) {
      console.error("Error loading impact analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "success":
        return "bg-green-500";
      case "transformation":
        return "bg-blue-500";
      case "community":
        return "bg-purple-500";
      case "innovation":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 80) return "bg-blue-500";
    if (progress >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const filteredStories =
    selectedCategory === "all"
      ? impactStories
      : impactStories.filter((story) => story.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-sg-primary">Loading Impact Analytics...</p>
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
                {branding.name} Impact Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-4">
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
                <button
                  onClick={() => router.push("/instant-analytics")}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Instant Analytics
                </button>
              </nav>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.name || user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-sg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-sg-accent/90 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", label: "Impact Overview" },
              { id: "stories", label: "Impact Stories" },
              { id: "metrics", label: "Impact Metrics" },
              { id: "analysis", label: "Deep Analysis" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as "overview" | "stories" | "metrics" | "analysis",
                  )
                }
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-sg-primary text-sg-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Impact Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Impact Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Total Impact
                </h3>
                <p className="text-3xl font-bold text-sg-primary">2.3M AUD</p>
                <p className="text-sm text-gray-600">Economic value created</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lives Impacted
                </h3>
                <p className="text-3xl font-bold text-sg-primary">1,247</p>
                <p className="text-sm text-gray-600">Direct beneficiaries</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Success Rate
                </h3>
                <p className="text-3xl font-bold text-sg-primary">92%</p>
                <p className="text-sm text-gray-600">Project completion rate</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Community Score
                </h3>
                <p className="text-3xl font-bold text-sg-primary">8.7/10</p>
                <p className="text-sm text-gray-600">Engagement rating</p>
              </div>
            </div>

            {/* Impact Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Impact by Category
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {["social", "economic", "environmental", "health"].map(
                      (category) => {
                        const categoryMetrics = impactMetrics.filter(
                          (m) => m.category === category,
                        );
                        const avgProgress =
                          categoryMetrics.length > 0
                            ? categoryMetrics.reduce(
                                (sum, m) => sum + m.progress,
                                0,
                              ) / categoryMetrics.length
                            : 0;
                        return (
                          <div
                            key={category}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium text-gray-900 capitalize">
                                {category}
                              </p>
                              <p className="text-sm text-gray-600">
                                {categoryMetrics.length} metrics
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {avgProgress.toFixed(1)}%
                              </p>
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getProgressColor(avgProgress)}`}
                                  style={{
                                    width: `${Math.min(avgProgress, 100)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Impact Stories
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {impactStories.slice(0, 3).map((story) => (
                      <div
                        key={story.id}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`w-3 h-3 rounded-full mt-2 ${getCategoryColor(story.category)}`}
                        ></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {story.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {story.impact}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(story.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Impact Stories Tab */}
        {activeTab === "stories" && (
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedCategory === "all"
                    ? "bg-sg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Stories
              </button>
              {["success", "transformation", "community", "innovation"].map(
                (category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
                      selectedCategory === category
                        ? "bg-sg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ),
              )}
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div
                    className={`h-2 ${getCategoryColor(story.category)}`}
                  ></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {story.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(story.category)} text-white`}
                      >
                        {story.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{story.description}</p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Participant:</span>{" "}
                        {story.participant}
                      </p>
                      <p>
                        <span className="font-medium">Project:</span>{" "}
                        {story.project}
                      </p>
                      <p>
                        <span className="font-medium">Impact:</span>{" "}
                        {story.impact}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(story.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impact Metrics Tab */}
        {activeTab === "metrics" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Impact Metrics Dashboard
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Metric
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Impact Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {impactMetrics.map((metric) => (
                      <tr key={metric.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {metric.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {metric.value} {metric.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {metric.target} {metric.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${getProgressColor(metric.progress)}`}
                                style={{
                                  width: `${Math.min(metric.progress, 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">
                              {metric.progress.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getImpactColor(metric.impact)}`}
                          >
                            {metric.impact}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">
                            {metric.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Deep Analysis Tab */}
        {activeTab === "analysis" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Impact Correlation Analysis
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Employment vs. Community Engagement
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        +0.87
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Skills Development vs. Economic Impact
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        +0.92
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Health Improvements vs. Social Impact
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        +0.78
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Impact Predictions
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Next Quarter Employment Rate
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        82%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Annual Economic Impact
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        3.2M AUD
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Community Engagement Growth
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        +15%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Impact Recommendations
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Expand Skills Development Programs
                      </p>
                      <p className="text-sm text-gray-600">
                        High correlation with economic impact suggests scaling
                        up skills training will increase overall impact.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Focus on Environmental Projects
                      </p>
                      <p className="text-sm text-gray-600">
                        Environmental metrics are below target - recommend
                        increasing environmental initiatives.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Strengthen Community Partnerships
                      </p>
                      <p className="text-sm text-gray-600">
                        Community engagement is high - leverage existing
                        relationships for broader impact.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

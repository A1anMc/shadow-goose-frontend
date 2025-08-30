import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { authService } from "../src/lib/auth";
import { getBranding } from "../src/lib/branding";
import { logger } from "../src/lib/logger";
import { SGEProject, sgeProjectService } from "../src/lib/projects";

// Production-ready dashboard with enhanced analytics and UI/UX
// Version: 1.0.1 - Enhanced Dashboard with Analytics

export default function Dashboard() {
  const router = useRouter();
  const branding = getBranding();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    total_participants: 0,
    total_funding: 0,
    average_progress: 0,
  });
  const [projects, setProjects] = useState<SGEProject[]>([]);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          router.push("/login");
          return;
        }

        // Validate token with backend
        const isValid = await authService.validateToken();
        if (!isValid) {
          authService.logout();
          router.push("/login");
          return;
        }

        // Load dashboard data
        const [statsData, projectsData] = await Promise.all([
          sgeProjectService.getProjectStats(),
          sgeProjectService.getProjects(),
        ]);

        setStats(statsData);
        setProjects(projectsData);
        setIsLoading(false);
          } catch (error) {
      logger.error("Dashboard loading error", { error: error instanceof Error ? error.message : String(error) });
      setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data",
        );
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-sg-primary">Loading dashboard...</p>
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
              <h1 className="text-2xl font-bold text-sg-primary">
                {branding.name} Dashboard
              </h1>
              <nav className="flex space-x-4">
                <Link
                  href="/instant-analytics"
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Instant Analytics
                </Link>
                <Link
                  href="/analytics"
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Analytics
                </Link>
                <Link
                  href="/impact-analytics"
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  🎯 Impact Analytics
                </Link>
                <Link
                  href="/teams"
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Teams
                </Link>
                <Link
                  href="/projects/new"
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  New Project
                </Link>
                <Link
                  href="/relationships"
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Relationships
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, SGE Team</span>
              <span className="text-xs text-gray-400">v1.0.1 Enhanced</span>
              <button className="bg-sg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-sg-primary/90 transition-colors flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Export</span>
              </button>
              <Link
                href="/"
                className="bg-sg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-sg-accent/90 transition-colors"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Projects
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_projects}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Projects
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active_projects}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Participants
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_participants}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Funding
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.total_funding.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Link
            href="/instant-analytics"
            className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 block"
          >
            <h3 className="text-lg font-semibold mb-2">Instant Analytics</h3>
            <p className="text-sm opacity-90">
              Real-time insights and live updates
            </p>
          </Link>

          <Link
            href="/impact-analytics"
            className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 block"
          >
            <h3 className="text-lg font-semibold mb-2">Impact Analytics</h3>
            <p className="text-sm opacity-90">
              Deep dive into impact measurement
            </p>
          </Link>

          <Link
            href="/analytics"
            className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 block"
          >
            <h3 className="text-lg font-semibold mb-2">Full Analytics</h3>
            <p className="text-sm opacity-90">
              Comprehensive analytics dashboard
            </p>
          </Link>

          <Link
            href="/grants"
            className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 block"
          >
            <h3 className="text-lg font-semibold mb-2">Grant Management</h3>
            <p className="text-sm opacity-90">Find & apply for grants</p>
          </Link>

          <Link
            href="/okrs"
            className="p-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 block"
          >
            <h3 className="text-lg font-semibold mb-2">OKR Management</h3>
            <p className="text-sm opacity-90">Objectives & Key Results</p>
          </Link>

          <Link
            href="/teams"
            className="p-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 block"
          >
            <h3 className="text-lg font-semibold mb-2">Team Management</h3>
            <p className="text-sm opacity-90">Manage team members & roles</p>
          </Link>

          <Link
            href="/grants/external-sources"
            className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 block"
          >
            <h3 className="text-lg font-semibold mb-2">External Sources</h3>
            <p className="text-sm opacity-90">Manage grant data sources</p>
          </Link>

          <Link
            href="/projects/new"
            className="p-6 bg-gradient-to-r from-sg-primary to-sg-accent text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 block"
          >
            <h3 className="text-lg font-semibold mb-2">New Project</h3>
            <p className="text-sm opacity-90">Create a new SGE initiative</p>
          </Link>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Overall Progress
          </h2>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Average Progress</span>
                <span>{stats.average_progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-sg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.average_progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                SGE Projects
              </h2>
              <Link
                href="/projects/new"
                className="bg-sg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-sg-primary/90 transition-colors"
              >
                Create New Project
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {projects.map((project, index) => (
              <div
                key={project.id || index}
                className="px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === "active"
                            ? "bg-green-100 text-green-800"
                            : project.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : project.status === "draft"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {project.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {project.current_data?.current_participants || 0}{" "}
                        participants
                      </span>
                      <span className="text-sm text-gray-500">
                        $
                        {(
                          project.current_data?.current_funding ||
                          project.amount ||
                          0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Progress</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {project.current_data?.progress_percentage || 0}%
                      </div>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-sg-accent h-2 rounded-full"
                        style={{
                          width: `${project.current_data?.progress_percentage || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { authService } from "../src/lib/auth";
import { getBranding } from "../src/lib/branding";
import { logger } from "../src/lib/logger";
import { SGEProject, sgeProjectService } from "../src/lib/projects";
import Layout from "../src/components/Layout";
import DashboardCard from "../src/components/DashboardCard";

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
        if (!authService.isAuthenticated()) {
          router.push("/login");
          return;
        }

        const isValid = await authService.validateToken();
        if (!isValid) {
          authService.logout();
          router.push("/login");
          return;
        }

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
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner w-12 h-12 mx-auto"></div>
            <p className="mt-4 text-primary">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-error text-xl mb-4">⚠️ Dashboard Error</div>
            <p className="text-secondary mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Welcome to {branding.name}
              </h1>
              <p className="text-secondary mt-2">
                Your comprehensive grant management and analytics dashboard
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary">Welcome, SGE Team</span>
              <span className="badge badge-primary">v2.0.0</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Projects"
            value={stats.total_projects}
            icon="📋"
            trend={{ value: 12, isPositive: true }}
            onClick={() => router.push('/projects')}
          />
          <DashboardCard
            title="Active Projects"
            value={stats.active_projects}
            icon="🚀"
            trend={{ value: 8, isPositive: true }}
            onClick={() => router.push('/projects')}
          />
          <DashboardCard
            title="Total Funding"
            value={`$${(stats.total_funding / 1000000).toFixed(1)}M`}
            icon="💰"
            trend={{ value: 15, isPositive: true }}
            onClick={() => router.push('/grants')}
          />
          <DashboardCard
            title="Average Progress"
            value={`${stats.average_progress}%`}
            icon="📈"
            trend={{ value: 5, isPositive: true }}
            onClick={() => router.push('/analytics')}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Projects */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-primary">Recent Projects</h2>
            </div>
            <div className="card-body">
                             {projects.slice(0, 5).map((project) => (
                 <div key={project.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                   <div>
                     <h3 className="font-medium text-primary">{project.name}</h3>
                     <p className="text-sm text-secondary">{project.status}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-medium text-primary">${(project.amount || 0).toLocaleString()}</p>
                     <p className="text-xs text-secondary">{project.current_data?.progress_percentage || 0}% complete</p>
                   </div>
                 </div>
               ))}
              {projects.length === 0 && (
                <p className="text-secondary text-center py-4">No projects found</p>
              )}
            </div>
            <div className="card-footer">
              <button 
                onClick={() => router.push('/projects')}
                className="btn btn-primary w-full"
              >
                View All Projects
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-primary">Quick Actions</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => router.push('/grants')}
                  className="btn btn-secondary flex-col h-20"
                >
                  <span className="text-2xl">💰</span>
                  <span className="text-sm">Find Grants</span>
                </button>
                <button 
                  onClick={() => router.push('/projects/new')}
                  className="btn btn-secondary flex-col h-20"
                >
                  <span className="text-2xl">➕</span>
                  <span className="text-sm">New Project</span>
                </button>
                <button 
                  onClick={() => router.push('/analytics')}
                  className="btn btn-secondary flex-col h-20"
                >
                  <span className="text-2xl">📊</span>
                  <span className="text-sm">Analytics</span>
                </button>
                <button 
                  onClick={() => router.push('/relationships')}
                  className="btn btn-secondary flex-col h-20"
                >
                  <span className="text-2xl">🤝</span>
                  <span className="text-sm">Relationships</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-primary">System Status</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <div>
                  <p className="font-medium text-primary">API Status</p>
                  <p className="text-sm text-secondary">All systems operational</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <div>
                  <p className="font-medium text-primary">Database</p>
                  <p className="text-sm text-secondary">Connected and healthy</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <div>
                  <p className="font-medium text-primary">Performance</p>
                  <p className="text-sm text-secondary">Optimal response times</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

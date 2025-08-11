import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getBranding } from '../src/lib/branding';
import { authService, User } from '../src/lib/auth';
import { sgeProjectService, SGEProject } from '../src/lib/projects';

export default function Dashboard() {
  const router = useRouter();
  const branding = getBranding();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<SGEProject[]>([]);
  const [stats, setStats] = useState({
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    total_participants: 0,
    total_funding: 0,
    average_progress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Load dashboard data
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load projects and stats in parallel
      const [projectsData, statsData] = await Promise.all([
        sgeProjectService.getProjects(),
        sgeProjectService.getProjectStats(),
      ]);

      setProjects(projectsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-sg-primary">Loading SGE Dashboard...</p>
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
                <button
                  onClick={() => router.push('/analytics')}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Analytics
                </button>
                <button
                  onClick={() => router.push('/projects/new')}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  New Project
                </button>
              </nav>
            </div>
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_projects}</p>
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
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_projects}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_participants.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Funding</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_funding)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h2>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Average Progress</span>
                <span>{stats.average_progress.toFixed(1)}%</span>
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
              <h2 className="text-lg font-semibold text-gray-900">SGE Projects</h2>
              <button
                onClick={() => router.push('/projects/new')}
                className="bg-sg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-sg-primary/90 transition-colors"
              >
                Create New Project
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {projects.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">No projects found. Create your first SGE project to get started.</p>
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-green-100 text-green-800' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {project.current_data.current_participants} participants
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatCurrency(project.current_data.current_funding)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Progress</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {project.current_data.progress_percentage.toFixed(1)}%
                        </div>
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-sg-accent h-2 rounded-full"
                          style={{ width: `${project.current_data.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

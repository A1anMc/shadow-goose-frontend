import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface User {
  username: string;
  email: string;
  role: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0
  });
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shadow-goose-api-staging.onrender.com';

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch user info
        const userResponse = await fetch(`${API_BASE_URL}/auth/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Authentication failed');
        }

        const userData = await userResponse.json();
        setUser(userData);

        // Fetch projects
        const projectsResponse = await fetch(`${API_BASE_URL}/api/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch projects');
        }

        const projectsData = await projectsResponse.json();
        const projectsList = projectsData.projects || [];
        
        setProjects(projectsList);
        setStats({
          totalProjects: projectsList.length,
          activeProjects: projectsList.filter((p: Project) => p.status === 'active').length,
          completedProjects: projectsList.filter((p: Project) => p.status === 'completed').length
        });

      } catch (err) {
        console.error('Dashboard initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router, API_BASE_URL]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Shadow Goose Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Dashboard Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Shadow Goose Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username} ({user?.role})
              </span>
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => router.push('/users')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors"
                  >
                    User Management
                  </button>
                  <button
                    onClick={() => router.push('/rules')}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 transition-colors"
                  >
                    Rules Engine
                  </button>
                  <button
                    onClick={() => router.push('/deployments')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
                  >
                    Deployments
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Projects</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalProjects}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900">Active Projects</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeProjects}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900">Completed</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.completedProjects}</p>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
              <button
                onClick={() => router.push('/projects/new')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Create New Project
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No projects yet. Create your first project!</p>
                <button
                  onClick={() => router.push('/projects/new')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                        <p className="text-gray-600 mt-1">{project.description}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Created: {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admin Features Section */}
        {user?.role === 'admin' && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Admin Features</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors" 
                  onClick={() => router.push('/rules')}
                >
                  <h3 className="text-lg font-medium text-gray-900">Rules Engine</h3>
                  <p className="text-gray-600 mt-1">Manage business logic and automation rules</p>
                </div>
                <div 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors" 
                  onClick={() => router.push('/deployments')}
                >
                  <h3 className="text-lg font-medium text-gray-900">Deployments</h3>
                  <p className="text-gray-600 mt-1">Track deployments and CI/CD workflows</p>
                </div>
                <div 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors" 
                  onClick={() => router.push('/users')}
                >
                  <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                  <p className="text-gray-600 mt-1">Manage users and permissions</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

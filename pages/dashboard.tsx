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
  updated_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchProjects(token);
  }, [router]);

  const fetchProjects = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shadow-goose-api-staging.onrender.com';
      
      const response = await fetch(`${apiUrl}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setRefreshing(true);
      await fetchProjects(token);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-sg-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sg-background">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="sg-heading text-xl font-semibold text-sg-primary">
                Shadow Goose Entertainment
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-sg-primary/60">
                Welcome, {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-sg-accent hover:text-sg-accent/80"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="sg-heading text-2xl font-bold text-sg-primary mb-4">
              Dashboard
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-sg-primary mb-4">User Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sg-primary/60">Username</label>
                  <p className="text-sg-primary">{user?.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sg-primary/60">Email</label>
                  <p className="text-sg-primary">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sg-primary/60">Role</label>
                  <p className="text-sg-primary capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="sg-heading text-xl font-semibold text-sg-primary">
                Projects ({projects.length})
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-3 py-1 text-sm text-sg-primary hover:text-sg-accent disabled:opacity-50"
                >
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  onClick={() => router.push('/projects/new')}
                  className="px-4 py-2 bg-sg-accent text-white text-sm font-medium rounded-md hover:bg-sg-accent/90"
                >
                  Create Project
                </button>
              </div>
            </div>
            
            {projects.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-sg-primary/60 mb-4">No projects yet</p>
                <button
                  onClick={() => router.push('/projects/new')}
                  className="px-4 py-2 bg-sg-accent text-white text-sm font-medium rounded-md hover:bg-sg-accent/90"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {projects.map((project) => (
                    <li key={project.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-sg-accent flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {project.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-sg-primary">
                                {project.name}
                              </div>
                              {project.description && (
                                <div className="text-sm text-sg-primary/60 mt-1">
                                  {project.description}
                                </div>
                              )}
                              <div className="text-sm text-sg-primary/60">
                                Created: {new Date(project.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                            <button
                              onClick={() => router.push(`/projects/${project.id}`)}
                              className="text-sm text-sg-accent hover:text-sg-accent/80"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Deployment {
  id: number;
  deployment_id: string;
  environment: string;
  branch_name: string;
  commit_message: string;
  user_role: string;
  priority: string;
  security_scan_status: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

interface Commit {
  id: number;
  branch_name: string;
  commit_message: string;
  user_role: string;
  pr_id?: string;
  files_changed: string[];
  status: string;
  created_at: string;
}

export default function Deployments() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [showCommitForm, setShowCommitForm] = useState(false);
  const [newDeployment, setNewDeployment] = useState<Partial<Deployment>>({
    environment: 'staging',
    branch_name: 'main',
    commit_message: '',
    priority: 'normal',
    security_scan_status: 'pending'
  });
  const [newCommit, setNewCommit] = useState<Partial<Commit>>({
    branch_name: 'main',
    commit_message: '',
    files_changed: []
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Check if current user is admin
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shadow-goose-api-staging.onrender.com';
    fetch(`${apiUrl}/auth/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setCurrentUser(data);
      fetchDeployments(token);
      fetchCommits(token);
    })
    .catch(() => router.push('/login'));
  }, [router]);

  const fetchDeployments = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shadow-goose-api-staging.onrender.com';
      const response = await fetch(`${apiUrl}/api/deployments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeployments(data.deployments || []);
      }
    } catch (error) {
      console.error('Error fetching deployments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommits = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shadow-goose-api-staging.onrender.com';
      const response = await fetch(`${apiUrl}/api/commits`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCommits(data.commits || []);
      }
    } catch (error) {
      console.error('Error fetching commits:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleCreateDeployment = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shadow-goose-api-staging.onrender.com';
      const response = await fetch(`${apiUrl}/api/deployments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDeployment)
      });

      if (response.ok) {
        setShowDeployForm(false);
        setNewDeployment({
          environment: 'staging',
          branch_name: 'main',
          commit_message: '',
          priority: 'normal',
          security_scan_status: 'pending'
        });
        fetchDeployments(token);
      }
    } catch (error) {
      console.error('Error creating deployment:', error);
    }
  };

  const handleCreateCommit = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shadow-goose-api-staging.onrender.com';
      const response = await fetch(`${apiUrl}/api/commits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCommit)
      });

      if (response.ok) {
        setShowCommitForm(false);
        setNewCommit({
          branch_name: 'main',
          commit_message: '',
          files_changed: []
        });
        fetchCommits(token);
      }
    } catch (error) {
      console.error('Error creating commit:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deployments...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Deployment Workflows</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Admin: {currentUser?.username}
              </span>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Deployments</h3>
            <p className="text-3xl font-bold text-blue-600">{deployments.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Commits</h3>
            <p className="text-3xl font-bold text-green-600">{commits.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Active Deployments</h3>
            <p className="text-3xl font-bold text-purple-600">
              {deployments.filter(d => d.status === 'running').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Failed Deployments</h3>
            <p className="text-3xl font-bold text-red-600">
              {deployments.filter(d => d.status === 'failed').length}
            </p>
          </div>
        </div>

        {/* Deployments */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Deployments</h2>
              <button
                onClick={() => setShowDeployForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                Create Deployment
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {deployments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No deployments yet. Create your first deployment!</p>
                <button
                  onClick={() => setShowDeployForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Deployment
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {deployments.map((deployment) => (
                  <div key={deployment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {deployment.deployment_id}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deployment.status)}`}>
                            {deployment.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deployment.priority)}`}>
                            {deployment.priority}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{deployment.commit_message}</p>
                        <div className="text-sm text-gray-500">
                          <span>Environment: {deployment.environment}</span>
                          <span className="mx-2">•</span>
                          <span>Branch: {deployment.branch_name}</span>
                          <span className="mx-2">•</span>
                          <span>Security: {deployment.security_scan_status}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Created: {new Date(deployment.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Commits */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Commits</h2>
              <button
                onClick={() => setShowCommitForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
              >
                Create Commit
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {commits.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No commits yet. Create your first commit!</p>
                <button
                  onClick={() => setShowCommitForm(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                >
                  Create Commit
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {commits.map((commit) => (
                  <div key={commit.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {commit.commit_message}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(commit.status)}`}>
                            {commit.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span>Branch: {commit.branch_name}</span>
                          {commit.pr_id && (
                            <>
                              <span className="mx-2">•</span>
                              <span>PR: {commit.pr_id}</span>
                            </>
                          )}
                          <span className="mx-2">•</span>
                          <span>Files: {commit.files_changed.length}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Created: {new Date(commit.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Deployment Modal */}
        {showDeployForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Deployment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Environment</label>
                    <select
                      value={newDeployment.environment}
                      onChange={(e) => setNewDeployment({...newDeployment, environment: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Branch</label>
                    <input
                      type="text"
                      value={newDeployment.branch_name}
                      onChange={(e) => setNewDeployment({...newDeployment, branch_name: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Commit Message</label>
                    <input
                      type="text"
                      value={newDeployment.commit_message}
                      onChange={(e) => setNewDeployment({...newDeployment, commit_message: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={newDeployment.priority}
                      onChange={(e) => setNewDeployment({...newDeployment, priority: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowDeployForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateDeployment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Deployment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Commit Modal */}
        {showCommitForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Commit</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Branch</label>
                    <input
                      type="text"
                      value={newCommit.branch_name}
                      onChange={(e) => setNewCommit({...newCommit, branch_name: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Commit Message</label>
                    <input
                      type="text"
                      value={newCommit.commit_message}
                      onChange={(e) => setNewCommit({...newCommit, commit_message: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PR ID (Optional)</label>
                    <input
                      type="text"
                      value={newCommit.pr_id || ''}
                      onChange={(e) => setNewCommit({...newCommit, pr_id: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCommitForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCommit}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Create Commit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
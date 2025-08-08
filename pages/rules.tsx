import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Rule {
  name: string;
  rule_type: string;
  description: string;
  conditions: any[];
  actions: any[];
}

interface RuleType {
  rule_types: string[];
  action_types: string[];
  condition_operators: string[];
}

export default function Rules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [ruleTypes, setRuleTypes] = useState<RuleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    name: '',
    rule_type: '',
    description: '',
    conditions: [],
    actions: []
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
      fetchRules(token);
      fetchRuleTypes(token);
    })
    .catch(() => router.push('/login'));
  }, [router]);

  const fetchRules = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shadow-goose-api-staging.onrender.com';
      const response = await fetch(`${apiUrl}/api/rules`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRules(data.rules || []);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRuleTypes = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shadow-goose-api-staging.onrender.com';
      const response = await fetch(`${apiUrl}/api/rules/types`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRuleTypes(data);
      }
    } catch (error) {
      console.error('Error fetching rule types:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleCreateRule = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shadow-goose-api-staging.onrender.com';
      const response = await fetch(`${apiUrl}/api/rules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRule)
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewRule({
          name: '',
          rule_type: '',
          description: '',
          conditions: [],
          actions: []
        });
        fetchRules(token);
      }
    } catch (error) {
      console.error('Error creating rule:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rules...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Rules Engine</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Rules</h3>
            <p className="text-3xl font-bold text-blue-600">{rules.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Rule Types</h3>
            <p className="text-3xl font-bold text-green-600">
              {ruleTypes?.rule_types?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Action Types</h3>
            <p className="text-3xl font-bold text-purple-600">
              {ruleTypes?.action_types?.length || 0}
            </p>
          </div>
        </div>

        {/* Rules Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Business Rules</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                Create New Rule
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {rules.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No rules configured yet. Create your first business rule!</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Rule
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {rules.map((rule, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{rule.name}</h3>
                        <p className="text-gray-600 mt-1">{rule.description}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Type: {rule.rule_type} • Conditions: {rule.conditions.length} • Actions: {rule.actions.length}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Rule Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Rule</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rule Name</label>
                    <input
                      type="text"
                      value={newRule.name}
                      onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rule Type</label>
                    <select
                      value={newRule.rule_type}
                      onChange={(e) => setNewRule({...newRule, rule_type: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a rule type</option>
                      {ruleTypes?.rule_types?.map((type: string) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newRule.description}
                      onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRule}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Rule
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
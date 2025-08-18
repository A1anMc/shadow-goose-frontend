import { useEffect, useState } from "react";
import { centralAuthService } from "../src/lib/auth-central";
import { getGrantsService } from "../src/lib/services/grants-service";
import { Grant } from "../src/lib/types/grants";

export default function TestGrantDetails() {
  const [grant, setGrant] = useState<Grant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalGrants, setTotalGrants] = useState(0);

  useEffect(() => {
    const fetchGrantDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ensure authentication
        if (!centralAuthService.isAuthenticated()) {
          const loginSuccess = await centralAuthService.autoLogin();
          if (!loginSuccess) {
            throw new Error('Authentication failed');
          }
        }

        // Get grants service
        const grantsService = getGrantsService();
        
        // Fetch all grants
        const result = await grantsService.getGrantsWithSource();
        setTotalGrants(result.data.length);
        
        if (result.data.length === 0) {
          throw new Error('No grants found');
        }

        // Get the first grant
        const firstGrant = result.data[0];
        setGrant(firstGrant);

        // Also test getting by ID
        const specificGrant = await grantsService.getGrantById(Number(firstGrant.id));
        console.log('Specific grant by ID:', specificGrant);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching grant details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrantDetails();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grant details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-600 text-xl mb-4">⚠️ No Grant Found</div>
          <p className="text-gray-600">No grants available to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grant Details Test</h1>
          <p className="text-gray-600">Total grants available: {totalGrants}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">{grant.title}</h2>
            <p className="text-blue-100 mt-1">{grant.organization}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ID</dt>
                    <dd className="text-sm text-gray-900">{grant.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Amount</dt>
                    <dd className="text-lg font-semibold text-green-600">
                      ${grant.amount?.toLocaleString() || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-sm text-gray-900">{grant.category}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm text-gray-900">{grant.status}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Priority</dt>
                    <dd className="text-sm text-gray-900">{grant.priority_score || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                    <dd className="text-sm text-gray-900">{grant.deadline}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Links</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact</dt>
                    <dd className="text-sm text-gray-900">{grant.contact_info || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Website</dt>
                    <dd className="text-sm text-gray-900">
                      {grant.application_url ? (
                        <a href={grant.application_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {grant.application_url}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tags</dt>
                    <dd className="text-sm text-gray-900">
                      {grant.sdg_alignment && grant.sdg_alignment.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {grant.sdg_alignment.map((tag, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'None'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900">{grant.created_at}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Updated</dt>
                    <dd className="text-sm text-gray-900">{grant.updated_at}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 leading-relaxed">{grant.description}</p>
            </div>

            {grant.eligibility && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Eligibility</h3>
                <p className="text-gray-700 leading-relaxed">{grant.eligibility}</p>
              </div>
            )}

            {grant.requirements && grant.requirements.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed">
                  {grant.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}

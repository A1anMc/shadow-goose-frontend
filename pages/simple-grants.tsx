import { useEffect, useState } from "react";

export default function SimpleGrants() {
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrants = async () => {
      try {
        setLoading(true);
        
        // Step 1: Get auth token
        const authResponse = await fetch('https://shadow-goose-api.onrender.com/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'test', password: 'test' })
        });
        
        const authData = await authResponse.json();
        const token = authData.access_token;
        
        if (!token) {
          throw new Error('Authentication failed');
        }

        // Step 2: Fetch grants directly
        const grantsResponse = await fetch('https://shadow-goose-api.onrender.com/api/grants', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const grantsData = await grantsResponse.json();
        setGrants(grantsData.grants || []);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchGrants();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grants...</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Simple Grants ({grants.length} found)
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grants.map((grant, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {grant.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {grant.description.substring(0, 150)}...
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-semibold text-green-600">
                      ${grant.amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium">{grant.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-medium">{grant.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Organisation:</span>
                    <span className="font-medium">{grant.organisation}</span>
                  </div>
                </div>

                {/* Eligibility Criteria */}
                {grant.eligibility_criteria && grant.eligibility_criteria.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Eligibility:</h3>
                    <div className="flex flex-wrap gap-1">
                      {grant.eligibility_criteria.slice(0, 3).map((item: string, idx: number) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                      {grant.eligibility_criteria.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          +{grant.eligibility_criteria.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Required Documents */}
                {grant.required_documents && grant.required_documents.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Required Documents:</h3>
                    <div className="flex flex-wrap gap-1">
                      {grant.required_documents.slice(0, 2).map((doc: string, idx: number) => (
                        <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {doc}
                        </span>
                      ))}
                      {grant.required_documents.length > 2 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          +{grant.required_documents.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Success Score: {grant.success_score || 'N/A'}
                  </span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {grants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No grants found</p>
          </div>
        )}
      </div>
    </div>
  );
}

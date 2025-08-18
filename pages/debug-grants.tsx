import { useEffect, useState } from "react";
import { centralAuthService } from "../src/lib/auth-central";
import { getGrantsService } from "../src/lib/services/grants-service";

export default function DebugGrants() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grants, setGrants] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any>(null);

  useEffect(() => {
    const debugGrants = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 DEBUG: Starting grants fetch...");

        // 1. Check authentication
        if (!centralAuthService.isAuthenticated()) {
          console.log("🔍 DEBUG: Not authenticated, attempting auto-login...");
          const loginSuccess = await centralAuthService.autoLogin();
          if (!loginSuccess) {
            throw new Error("Authentication failed");
          }
        }
        console.log("🔍 DEBUG: Authentication successful");

        // 2. Get grants service
        const grantsService = getGrantsService();
        console.log("🔍 DEBUG: Grants service initialized");

        // 3. Fetch grants
        console.log("🔍 DEBUG: Fetching grants...");
        const result = await grantsService.getGrantsWithSource();
        console.log("🔍 DEBUG: Raw result:", result);
        
        setRawData(result);
        setGrants(result.data || []);

        console.log("🔍 DEBUG: Grants loaded successfully:", result.data?.length);

      } catch (err) {
        console.error("🔍 DEBUG: Error:", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    debugGrants();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Debugging grants...</p>
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
          <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto max-w-2xl">
            {error}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Grants Debug</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Raw Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Raw API Response</h2>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </div>

          {/* Processed Grants */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Processed Grants ({grants.length})</h2>
            {grants.length > 0 ? (
              <div className="space-y-4">
                {grants.slice(0, 3).map((grant, index) => (
                  <div key={index} className="border rounded p-4">
                    <h3 className="font-semibold">{grant.title}</h3>
                    <p className="text-sm text-gray-600">ID: {grant.id}</p>
                    <p className="text-sm text-gray-600">Amount: ${grant.amount}</p>
                    <p className="text-sm text-gray-600">Category: {grant.category}</p>
                    <p className="text-sm text-gray-600">Status: {grant.status}</p>
                    <p className="text-sm text-gray-600">Organisation: {grant.organisation}</p>
                    <p className="text-sm text-gray-600">
                      Eligibility Criteria: {grant.eligibility_criteria?.length || 0} items
                    </p>
                    <p className="text-sm text-gray-600">
                      Required Documents: {grant.required_documents?.length || 0} items
                    </p>
                    <p className="text-sm text-gray-600">Success Score: {grant.success_score}</p>
                  </div>
                ))}
                {grants.length > 3 && (
                  <p className="text-gray-500">... and {grants.length - 3} more grants</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No grants found</p>
            )}
          </div>
        </div>

        {/* Test Buttons */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                console.log("🔍 DEBUG: Current grants:", grants);
                console.log("🔍 DEBUG: Raw data:", rawData);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Log to Console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

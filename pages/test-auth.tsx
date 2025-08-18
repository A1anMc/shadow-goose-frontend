import { useEffect, useState } from "react";
import { authService } from "../src/lib/auth";
import { getGrantsService } from "../src/lib/services/grants-service";

export default function TestAuth() {
  const [status, setStatus] = useState("Loading...");
  const [grants, setGrants] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAuth = async () => {
      try {
        setStatus("Testing authentication...");
        
        // Test if user is authenticated
        const isAuth = authService.isAuthenticated();
        setStatus(`Authentication status: ${isAuth ? 'Authenticated' : 'Not authenticated'}`);
        
        if (!isAuth) {
          setStatus("Attempting auto-login...");
          const loginSuccess = await authService.autoLogin();
          if (loginSuccess) {
            setStatus("Auto-login successful!");
          } else {
            setError("Auto-login failed");
            return;
          }
        }
        
        // Test grants API
        setStatus("Fetching grants...");
        const grantsService = getGrantsService();
        const grantsData = await grantsService.getGrants();
        setGrants(grantsData);
        setStatus(`Success! Found ${grantsData.length} grants`);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus("Test failed");
      }
    };

    testAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-lg">{status}</p>
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {grants.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Grants ({grants.length})</h2>
            <div className="space-y-4">
              {grants.slice(0, 3).map((grant, index) => (
                <div key={index} className="border rounded p-4">
                  <h3 className="font-semibold">{grant.title}</h3>
                  <p className="text-gray-600">{grant.organisation}</p>
                  <p className="text-green-600 font-semibold">${grant.amount?.toLocaleString()}</p>
                </div>
              ))}
              {grants.length > 3 && (
                <p className="text-gray-500">... and {grants.length - 3} more grants</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

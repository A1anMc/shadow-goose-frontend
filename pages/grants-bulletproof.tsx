import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { authService } from "../src/lib/auth";
import { getBranding } from "../src/lib/branding";
import { getGrantsService } from "../src/lib/services/grants-service";
import { Grant, GrantSearchFilters } from "../src/lib/types/grants";

export default function BulletproofGrants() {
  const router = useRouter();
  const branding = getBranding();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reliability, setReliability] = useState<number>(0);
  const [dataSource, setDataSource] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadGrants();
  }, [router]);

  const loadGrants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Loading grants with bulletproof service...');
      const grantsService = getGrantsService();
      const result = await grantsService.getGrantsWithSource();
      
      setGrants(result.data);
      setReliability(result.reliability);
      setDataSource(result.source);
      setLastUpdated(result.timestamp);
      setErrors(result.errors);
      
      console.log(`✅ Grants loaded successfully!`, {
        count: result.data.length,
        source: result.source,
        reliability: result.reliability,
        errors: result.errors
      });
      
    } catch (error) {
      console.error('💥 Unexpected error in bulletproof grants:', error);
      setError('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchFilters: GrantSearchFilters) => {
    try {
      setLoading(true);
      const grantsService = getGrantsService();
      const result = await grantsService.searchGrantsWithFilters(searchFilters);
      setGrants(result.data);
      setReliability(result.reliability);
      setDataSource(result.source);
      setLastUpdated(result.timestamp);
      setErrors(result.errors);
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getDataSourceIcon = (source: string) => {
    switch (source) {
      case 'primary': return '🟢';
      case 'cache': return '🟡';
      case 'fallback': return '🟠';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {branding.name} - Grants Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Bulletproof grant discovery system
              </p>
            </div>
            
            {/* Reliability Status */}
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-2 rounded-full text-sm font-medium ${getReliabilityColor(reliability)}`}>
                {getDataSourceIcon(dataSource)} {dataSource.toUpperCase()} • {reliability}% Reliable
              </div>
              <button
                onClick={loadGrants}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '🔄' : '🔄'} Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
              </span>
              <span className="text-sm text-gray-600">
                Found {grants.length} grants
              </span>
            </div>
            
            {errors.length > 0 && (
              <div className="text-sm text-red-600">
                ⚠️ {errors.length} error(s) occurred
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-red-800 mb-2">System Issues Detected:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg text-gray-600">Loading grants...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">❌ {error}</div>
            <button
              onClick={loadGrants}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Grants Grid */}
        {!loading && !error && grants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grants.map((grant) => (
              <div key={grant.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {grant.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      grant.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {grant.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {grant.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-medium text-green-600">
                        ${grant.amount?.toLocaleString() || 'TBD'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{grant.category}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deadline:</span>
                      <span className="font-medium">
                        {grant.deadline ? new Date(grant.deadline).toLocaleDateString() : 'TBD'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Source: {grant.data_source || 'unknown'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && grants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No grants found</div>
            <button
              onClick={loadGrants}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { authService } from "../../src/lib/auth";
import { getBranding } from "../../src/lib/branding";
import { ExternalGrantSource, externalGrantsService } from "../../src/lib/external-grants-service";
import { getGrantsService } from "../../src/lib/services/grants-service";


import { logger } from '../../src/lib/logger';
export default function ExternalGrantSources() {
  const router = useRouter();
  const branding = getBranding();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<ExternalGrantSource[]>([]);
  const [stats, setStats] = useState({
    totalSources: 0,
    enabledSources: 0,
    totalGrants: 0,
    lastSync: '',
    sourcesSynced: 0
  });

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push("/login");
          return;
        }

        const grantsService = getGrantsService();
        const [sourcesData, statsData] = await Promise.all([
          externalGrantsService.getSources(),
          grantsService.getExternalSourcesStats()
        ]);

        setSources(sourcesData);
        setStats(statsData);
        setIsLoading(false);
      } catch (error) {
        logger.error("Error loading external sources:", error);
        setError(error instanceof Error ? error.message : "Failed to load external sources");
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const handleToggleSource = async (sourceId: string, enabled: boolean) => {
    try {
      externalGrantsService.toggleSource(sourceId, enabled);
      setSources(prev => prev.map(source => 
        source.id === sourceId ? { ...source, enabled } : source
      ));
    } catch (error) {
      logger.error("Error toggling source:", error);
    }
  };

  const handleSyncSource = async (sourceId: string) => {
    try {
      const result = await externalGrantsService.fetchFromSource(sourceId);
      if (result.success) {
        // Update the source with new data
        setSources(prev => prev.map(source => 
          source.id === sourceId 
            ? { ...source, grantCount: result.grants.length, lastSync: new Date().toISOString() }
            : source
        ));
      } else {
        logger.error(`Failed to sync ${sourceId}:`, result.errors);
      }
    } catch (error) {
      logger.error("Error syncing source:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-sg-primary">Loading external sources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-sg-primary text-white px-4 py-2 rounded-md hover:bg-sg-primary/90"
          >
            Retry
          </button>
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
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sg-primary hover:text-sg-primary/80"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-sg-primary">
                External Grant Sources
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {branding.name}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Sources</h3>
            <p className="text-3xl font-bold text-sg-primary">{stats.totalSources}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Enabled Sources</h3>
            <p className="text-3xl font-bold text-green-600">{stats.enabledSources}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Grants</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalGrants}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Last Sync</h3>
            <p className="text-sm text-gray-600">
              {new Date(stats.lastSync).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Sources List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Grant Sources</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage external grant data sources and their integration status
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {sources.map((source) => (
              <div key={source.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{source.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        source.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {source.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{source.baseUrl}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Grants: {source.grantCount}</span>
                      <span>Last Sync: {new Date(source.lastSync).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleSource(source.id, !source.enabled)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        source.enabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {source.enabled ? 'Disable' : 'Enable'}
                    </button>
                    {source.enabled && (
                      <button
                        onClick={() => handleSyncSource(source.id)}
                        className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      >
                        Sync Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sync All Button */}
        <div className="mt-6 text-center">
          <button
            onClick={async () => {
              const enabledSources = sources.filter(s => s.enabled);
              for (const source of enabledSources) {
                await handleSyncSource(source.id);
              }
            }}
            className="bg-sg-primary text-white px-6 py-3 rounded-md hover:bg-sg-primary/90 font-medium"
          >
            Sync All Enabled Sources
          </button>
        </div>
      </main>
    </div>
  );
}

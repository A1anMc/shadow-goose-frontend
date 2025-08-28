import { useEffect, useState } from 'react';
import { DiscoveryResult, grantDiscoveryEngine, GrantMatch, GrantMatchingCriteria } from '../lib/grant-discovery-engine';
import { monitorLogger } from '../lib/logger';

interface GrantDiscoveryDashboardProps {
  className?: string;
}

export default function GrantDiscoveryDashboard({ className = '' }: GrantDiscoveryDashboardProps) {
  const [searchCriteria, setSearchCriteria] = useState<GrantMatchingCriteria>({
    industry: [],
    location: [],
    fundingAmount: { min: 10000, max: 100000 },
    eligibility: [],
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    keywords: [],
    status: 'open'
  });

  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string>('');

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [categoriesData, industriesData, locationsData] = await Promise.all([
        grantDiscoveryEngine.getCategories(),
        grantDiscoveryEngine.getIndustries(),
        grantDiscoveryEngine.getLocations()
      ]);

      setCategories(categoriesData);
      setIndustries(industriesData);
      setLocations(locationsData);
    } catch (error) {
      monitorLogger.error('Failed to load filter options', 'loadFilterOptions', error as Error);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await grantDiscoveryEngine.discoverGrants(searchCriteria);
      setDiscoveryResult(result);
      monitorLogger.info('Grant discovery search completed', 'handleSearch', {
        matchesFound: result.matches.length,
        searchTime: result.searchTime
      });
    } catch (error) {
      setError('Failed to search for grants. Please try again.');
      monitorLogger.error('Grant discovery search failed', 'handleSearch', error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeywordChange = (value: string) => {
    setSelectedKeywords(value);
    setSearchCriteria(prev => ({
      ...prev,
      keywords: value.split(',').map(k => k.trim()).filter(k => k.length > 0)
    }));
  };

  const handleIndustryChange = (industry: string, checked: boolean) => {
    setSearchCriteria(prev => ({
      ...prev,
      industry: checked 
        ? [...prev.industry, industry]
        : prev.industry.filter(i => i !== industry)
    }));
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    setSearchCriteria(prev => ({
      ...prev,
      location: checked 
        ? [...prev.location, location]
        : prev.location.filter(l => l !== location)
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'screen_australia': return 'bg-blue-100 text-blue-800';
      case 'creative_australia': return 'bg-purple-100 text-purple-800';
      case 'fallback': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <h1 className="text-3xl font-bold mb-2">Grant Discovery Dashboard</h1>
          <p className="text-blue-100">Find the perfect grants for your organization</p>
        </div>

        {/* Search Criteria */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Search Criteria</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Funding Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funding Amount Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={searchCriteria.fundingAmount.min}
                  onChange={(e) => setSearchCriteria(prev => ({
                    ...prev,
                    fundingAmount: { ...prev.fundingAmount, min: parseInt(e.target.value) || 0 }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="self-center text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={searchCriteria.fundingAmount.max}
                  onChange={(e) => setSearchCriteria(prev => ({
                    ...prev,
                    fundingAmount: { ...prev.fundingAmount, max: parseInt(e.target.value) || 0 }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={searchCriteria.category || ''}
                onChange={(e) => setSearchCriteria(prev => ({
                  ...prev,
                  category: e.target.value || undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={searchCriteria.status || ''}
                onChange={(e) => setSearchCriteria(prev => ({
                  ...prev,
                  status: e.target.value as 'open' | 'closed' | 'upcoming' | undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="upcoming">Upcoming</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Keywords */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g., youth, community, innovation"
                value={selectedKeywords}
                onChange={(e) => handleKeywordChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Industry and Location Filters */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Industries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industries
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                {industries.map(industry => (
                  <label key={industry} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={searchCriteria.industry.includes(industry)}
                      onChange={(e) => handleIndustryChange(industry, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{industry}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Locations
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                {locations.map(location => (
                  <label key={location} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={searchCriteria.location.includes(location)}
                      onChange={(e) => handleLocationChange(location, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{location}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-6">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Searching...' : 'Discover Grants'}
            </button>
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {discoveryResult && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                Discovery Results ({discoveryResult.matches.length} matches)
              </h2>
              <div className="text-sm text-gray-600">
                Found {discoveryResult.totalFound} grants in {discoveryResult.searchTime}ms
              </div>
            </div>

            {/* Sources */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Data Sources</h3>
              <div className="flex space-x-2">
                {discoveryResult.sources.map(source => (
                  <span key={source} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {source}
                  </span>
                ))}
              </div>
            </div>

            {/* Grant Matches */}
            <div className="space-y-4">
              {discoveryResult.matches.map((match: GrantMatch) => (
                <div key={match.grant.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{match.grant.title}</h3>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(match.priority)}`}>
                        {match.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getSourceColor(match.source)}`}>
                        {match.source.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3">{match.grant.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Amount:</span>
                      <p className="text-sm text-gray-600">
                        ${match.grant.amount.min.toLocaleString()} - ${match.grant.amount.max.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Deadline:</span>
                      <p className="text-sm text-gray-600">
                        {new Date(match.grant.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Match Score:</span>
                      <p className="text-sm text-gray-600">{match.matchScore}%</p>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  {match.matchReasons.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Why this matches:</span>
                      <ul className="mt-1 space-y-1">
                        {match.matchReasons.map((reason, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  {match.grant.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {match.grant.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <a
                      href={match.grant.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Apply Now
                    </a>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
                      Save Grant
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {discoveryResult.matches.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No grants found matching your criteria.</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your search parameters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

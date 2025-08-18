import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { sgeGrantDiscoveryEngine } from '../../src/lib/services/sge-grant-discovery';
import { sgeGrantsService } from '../../src/lib/services/sge-grants-service';
import { SGEGrant, SGESearchFilters, SGEGrantDiscoveryResult } from '../../src/lib/types/sge-types';

const SGEGrantsDiscovery: React.FC = () => {
  const router = useRouter();
  const [discoveryResult, setDiscoveryResult] = useState<SGEGrantDiscoveryResult | null>(null);
  const [grants, setGrants] = useState<SGEGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SGESearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadGrants();
  }, []);

  const loadGrants = async () => {
    try {
      setLoading(true);
      
      // Discover new grants using ML engine
      const discovery = await sgeGrantDiscoveryEngine.discoverNewGrants();
      setDiscoveryResult(discovery);
      setGrants(discovery.grants);
    } catch (err) {
      setError('Failed to load grants');
      console.error('Error loading grants:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const filteredGrants = await sgeGrantDiscoveryEngine.searchGrants(filters);
      setGrants(filteredGrants);
    } catch (err) {
      setError('Failed to apply filters');
      console.error('Error applying filters:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({});
    loadGrants();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'documentary': return '🎬';
      case 'digital': return '💻';
      case 'community': return '🤝';
      case 'multicultural': return '🌍';
      default: return '📺';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful': return 'text-green-600 bg-green-100';
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'unsuccessful': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlignmentColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Discovering SGE Grants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Grants</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadGrants}
            className="bg-sg-primary text-white px-4 py-2 rounded-lg hover:bg-sg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SGE Grant Discovery</h1>
              <p className="text-gray-600 mt-1">ML-Powered Grant Matching for Media Projects & Cultural Impact</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
              <button
                onClick={() => router.push('/sge-dashboard')}
                className="bg-sg-primary text-white px-4 py-2 rounded-lg hover:bg-sg-primary-dark"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Discovery Stats */}
        {discoveryResult && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-sg-primary">{discoveryResult.totalFound}</div>
                <div className="text-sm text-gray-600">Grants Found</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{discoveryResult.sourcesSearched}</div>
                <div className="text-sm text-gray-600">Sources Searched</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{discoveryResult.matchDistribution.high}</div>
                <div className="text-sm text-gray-600">High Match (80%+)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{discoveryResult.matchDistribution.medium}</div>
                <div className="text-sm text-gray-600">Medium Match (60-79%)</div>
              </div>
            </div>
            
            {/* Recommendations */}
            {discoveryResult.recommendations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 ML Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {discoveryResult.recommendations.map((rec, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Media Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
                <select
                  value={filters.media_type?.[0] || ''}
                  onChange={(e) => setFilters({ ...filters, media_type: e.target.value ? [e.target.value] : undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Types</option>
                  <option value="documentary">Documentary</option>
                  <option value="digital">Digital</option>
                  <option value="community">Community</option>
                  <option value="multicultural">Multicultural</option>
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                <input
                  type="number"
                  value={filters.min_amount || ''}
                  onChange={(e) => setFilters({ ...filters, min_amount: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Min amount"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                <input
                  type="number"
                  value={filters.max_amount || ''}
                  onChange={(e) => setFilters({ ...filters, max_amount: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Max amount"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Cultural Focus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cultural Focus</label>
                <select
                  value={filters.cultural_representation?.[0] || ''}
                  onChange={(e) => setFilters({ ...filters, cultural_representation: e.target.value ? [e.target.value] : undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All</option>
                  <option value="multicultural">Multicultural</option>
                  <option value="indigenous">Indigenous</option>
                  <option value="diverse voices">Diverse Voices</option>
                </select>
              </div>

              {/* Social Impact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Social Impact</label>
                <select
                  value={filters.social_impact_areas?.[0] || ''}
                  onChange={(e) => setFilters({ ...filters, social_impact_areas: e.target.value ? [e.target.value] : undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All</option>
                  <option value="cultural representation">Cultural Representation</option>
                  <option value="community engagement">Community Engagement</option>
                  <option value="social cohesion">Social Cohesion</option>
                </select>
              </div>

              {/* Diversity Focus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diversity Focus</label>
                <select
                  value={filters.diversity_focus?.toString() || ''}
                  onChange={(e) => setFilters({ ...filters, diversity_focus: e.target.value === 'true' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All</option>
                  <option value="true">Diversity Focused</option>
                  <option value="false">Not Diversity Focused</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={applyFilters}
                className="bg-sg-primary text-white px-6 py-2 rounded-lg hover:bg-sg-primary-dark"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Grants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grants.map((grant) => (
            <div key={grant.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Grant Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{getMediaTypeIcon(grant.media_type || '')}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(grant.sge_status || '')}`}>
                    {grant.sge_status || 'discovered'}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{grant.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{grant.organization}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-green-600">{formatCurrency(grant.amount)}</span>
                  <span className="text-sm text-gray-500">
                    Due: {new Date(grant.deadline).toLocaleDateString()}
                  </span>
                </div>

                {/* SGE Alignment Score */}
                {grant.sge_alignment_score && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>SGE Fit</span>
                      <span className={getAlignmentColor(grant.sge_alignment_score)}>
                        {formatPercentage(grant.sge_alignment_score)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-sg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${grant.sge_alignment_score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Grant Details */}
              <div className="p-6">
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{grant.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {grant.media_type && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {grant.media_type}
                    </span>
                  )}
                  {grant.cultural_representation && grant.cultural_representation.length > 0 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Cultural
                    </span>
                  )}
                  {grant.diversity_focus && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Diversity
                    </span>
                  )}
                </div>

                {/* ML Recommendations */}
                {grant.sge_recommendations && grant.sge_recommendations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">🤖 ML Insights</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {grant.sge_recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-sg-primary mr-1">•</span>
                          <span className="line-clamp-2">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/sge/grants/${grant.id}`)}
                    className="flex-1 bg-sg-primary text-white py-2 px-4 rounded-lg hover:bg-sg-primary-dark text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => router.push(`/sge/applications/new?grantId=${grant.id}`)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {grants.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Grants Found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or check back later for new opportunities.</p>
            <button
              onClick={clearFilters}
              className="bg-sg-primary text-white px-6 py-2 rounded-lg hover:bg-sg-primary-dark"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Load More */}
        {grants.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadGrants}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Refresh Grants
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SGEGrantsDiscovery;

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getBranding } from '../../src/lib/branding';
import { authService } from '../../src/lib/auth';
import { sgeProjectService, CreateProjectRequest, KeyIndicator } from '../../src/lib/projects';

export default function NewProject() {
  const router = useRouter();
  const branding = getBranding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    baseline_data: {
      start_date: '',
      target_participants: 0,
      target_outcomes: [''],
      initial_funding: 0,
      geographic_area: '',
      target_demographics: [''],
    },
    key_indicators: [
      {
        name: '',
        description: '',
        baseline_value: 0,
        target_value: 0,
        unit: '',
        category: 'participant',
      },
    ],
  });

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof typeof prev] as Record<string, any>),
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleArrayInputChange = (section: string, field: string, index: number, value: string) => {
    setFormData(prev => {
      if (section === 'baseline_data') {
        return {
          ...prev,
          baseline_data: {
            ...prev.baseline_data,
            [field]: (prev.baseline_data[field as keyof typeof prev.baseline_data] as string[]).map((item: string, i: number) =>
              i === index ? value : item
            ),
          },
        };
      }
      return prev;
    });
  };

  const addArrayItem = (section: string, field: string) => {
    setFormData(prev => {
      if (section === 'baseline_data') {
        return {
          ...prev,
          baseline_data: {
            ...prev.baseline_data,
            [field]: [...(prev.baseline_data[field as keyof typeof prev.baseline_data] as string[]), ''],
          },
        };
      }
      return prev;
    });
  };

  const removeArrayItem = (section: string, field: string, index: number) => {
    setFormData(prev => {
      if (section === 'baseline_data') {
        return {
          ...prev,
          baseline_data: {
            ...prev.baseline_data,
            [field]: (prev.baseline_data[field as keyof typeof prev.baseline_data] as string[]).filter((_: string, i: number) => i !== index),
          },
        };
      }
      return prev;
    });
  };

  const handleIndicatorChange = (index: number, field: keyof KeyIndicator, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      key_indicators: prev.key_indicators.map((indicator, i) =>
        i === index ? { ...indicator, [field]: value } : indicator
      ),
    }));
  };

  const addIndicator = () => {
    setFormData(prev => ({
      ...prev,
      key_indicators: [
        ...prev.key_indicators,
        {
          name: '',
          description: '',
          baseline_value: 0,
          target_value: 0,
          unit: '',
          category: 'participant',
        },
      ],
    }));
  };

  const removeIndicator = (index: number) => {
    setFormData(prev => ({
      ...prev,
      key_indicators: prev.key_indicators.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const project = await sgeProjectService.createProject(formData);
      if (project) {
        router.push('/dashboard');
      } else {
        setError('Failed to create project. Please try again.');
      }
    } catch (error) {
      setError('An error occurred while creating the project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-sg-primary">
                Create New SGE Project
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Project Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="baseline_data.start_date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                  value={formData.baseline_data.start_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Baseline Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Baseline Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Participants *
                </label>
                <input
                  type="number"
                  name="baseline_data.target_participants"
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                  value={formData.baseline_data.target_participants}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Funding (AUD) *
                </label>
                <input
                  type="number"
                  name="baseline_data.initial_funding"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                  value={formData.baseline_data.initial_funding}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Geographic Area *
                </label>
                <input
                  type="text"
                  name="baseline_data.geographic_area"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                  value={formData.baseline_data.geographic_area}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Target Outcomes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Outcomes
              </label>
              {formData.baseline_data.target_outcomes.map((outcome, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => handleArrayInputChange('baseline_data', 'target_outcomes', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                    placeholder="Enter target outcome"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('baseline_data', 'target_outcomes', index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                                    onClick={() => addArrayItem('baseline_data', 'target_outcomes')}
                className="text-sg-primary hover:text-sg-primary/80 text-sm"
              >
                + Add Outcome
              </button>
            </div>

            {/* Target Demographics */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Demographics
              </label>
              {formData.baseline_data.target_demographics.map((demographic, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={demographic}
                    onChange={(e) => handleArrayInputChange('baseline_data', 'target_demographics', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                    placeholder="Enter demographic group"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('baseline_data', 'target_demographics', index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                                    onClick={() => addArrayItem('baseline_data', 'target_demographics')}
                className="text-sg-primary hover:text-sg-primary/80 text-sm"
              >
                + Add Demographic
              </button>
            </div>
          </div>

          {/* Key Indicators */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Key Indicators</h2>
              <button
                type="button"
                onClick={addIndicator}
                className="text-sg-primary hover:text-sg-primary/80 text-sm"
              >
                + Add Indicator
              </button>
            </div>

            {formData.key_indicators.map((indicator, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium text-gray-900">Indicator {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeIndicator(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={indicator.name}
                      onChange={(e) => handleIndicatorChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={indicator.category}
                      onChange={(e) => handleIndicatorChange(index, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                    >
                      <option value="participant">Participant</option>
                      <option value="outcome">Outcome</option>
                      <option value="financial">Financial</option>
                      <option value="impact">Impact</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Baseline Value *
                    </label>
                    <input
                      type="number"
                      value={indicator.baseline_value}
                      onChange={(e) => handleIndicatorChange(index, 'baseline_value', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Value *
                    </label>
                    <input
                      type="number"
                      value={indicator.target_value}
                      onChange={(e) => handleIndicatorChange(index, 'target_value', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <input
                      type="text"
                      value={indicator.unit}
                      onChange={(e) => handleIndicatorChange(index, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                      placeholder="e.g., people, %, dollars"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={indicator.description}
                      onChange={(e) => handleIndicatorChange(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-sg-primary text-white rounded-md hover:bg-sg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

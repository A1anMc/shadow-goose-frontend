import React, { useState, useEffect } from 'react';
import { relationshipService } from '../lib/relationship-service';
import {
  RelationshipEventForm as EventFormData,
  StakeholderProfile,
  RelationshipTag,
  InteractionQuality,
  RelationshipStage,
  StakeholderType,
  StakeholderCategory,
  PriorityLevel,
  ContactDetails
} from '../lib/types/relationship-types';

interface RelationshipEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<EventFormData>;
  stakeholder?: StakeholderProfile;
}

export default function RelationshipEventForm({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  stakeholder
}: RelationshipEventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    event_date: new Date().toISOString().split('T')[0],
    stakeholder_name: stakeholder?.name || '',
    event_name: '',
    purpose: '',
    key_discussion_points: [''],
    follow_up_actions: [''],
    contact_details: {
      name: '',
      email: '',
      phone: '',
      organization: '',
      position: '',
      linkedin: '',
      notes: ''
    },
    tags: [],
    relationship_stage: 'initial_contact',
    health_score: 50,
    interaction_quality: 'neutral',
    outcome_rating: 3,
    stakeholder_type: stakeholder?.stakeholder_type,
    stakeholder_category: stakeholder?.stakeholder_category,
    priority_level: 'medium',
    is_public: false
  });

  const [availableTags, setAvailableTags] = useState<RelationshipTag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTags();
      if (initialData) {
        setFormData(prev => ({ ...prev, ...initialData }));
      }
      if (stakeholder) {
        setFormData(prev => ({
          ...prev,
          stakeholder_name: stakeholder.name,
          stakeholder_type: stakeholder.stakeholder_type,
          stakeholder_category: stakeholder.stakeholder_category,
          contact_details: {
            ...prev.contact_details,
            name: stakeholder.name,
            email: stakeholder.email || '',
            phone: stakeholder.phone || '',
            organization: stakeholder.organization || ''
          }
        }));
      }
    }
  }, [isOpen, initialData, stakeholder]);

  const loadTags = async () => {
    try {
      const response = await relationshipService.getTags();
      if (response.success && response.data) {
        setAvailableTags(response.data);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactDetailsChange = (field: keyof ContactDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_details: { ...prev.contact_details, [field]: value }
    }));
  };

  const handleArrayFieldChange = (field: 'key_discussion_points' | 'follow_up_actions', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayFieldItem = (field: 'key_discussion_points' | 'follow_up_actions') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayFieldItem = (field: 'key_discussion_points' | 'follow_up_actions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleTagToggle = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Clean up empty array items
      const cleanedData = {
        ...formData,
        key_discussion_points: formData.key_discussion_points.filter(point => point.trim() !== ''),
        follow_up_actions: formData.follow_up_actions.filter(action => action.trim() !== '')
      };

      const response = await relationshipService.createEvent(cleanedData);
      
      if (response.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          event_date: new Date().toISOString().split('T')[0],
          stakeholder_name: '',
          event_name: '',
          purpose: '',
          key_discussion_points: [''],
          follow_up_actions: [''],
          contact_details: {
            name: '',
            email: '',
            phone: '',
            organization: '',
            position: '',
            linkedin: '',
            notes: ''
          },
          tags: [],
          relationship_stage: 'initial_contact',
          health_score: 50,
          interaction_quality: 'neutral',
          outcome_rating: 3,
          stakeholder_type: undefined,
          stakeholder_category: undefined,
          priority_level: 'medium',
          is_public: false
        });
      } else {
        setError(response.error || 'Failed to create event');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-gray-900">Log Relationship Event</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Event Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.event_date}
                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stakeholder Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.stakeholder_name}
                  onChange={(e) => handleInputChange('stakeholder_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                required
                value={formData.event_name}
                onChange={(e) => handleInputChange('event_name', e.target.value)}
                placeholder="e.g., Initial Meeting, Follow-up Call, Partnership Discussion"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose of Meeting *
              </label>
              <textarea
                required
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                placeholder="Describe the main purpose and objectives of this interaction"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
              />
            </div>

            {/* Key Discussion Points */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Discussion Points
              </label>
              {formData.key_discussion_points.map((point, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleArrayFieldChange('key_discussion_points', index, e.target.value)}
                    placeholder="Enter a key discussion point"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                  />
                  {formData.key_discussion_points.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayFieldItem('key_discussion_points', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayFieldItem('key_discussion_points')}
                className="text-sg-primary hover:text-sg-primary/80 text-sm"
              >
                + Add Discussion Point
              </button>
            </div>

            {/* Follow-up Actions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Actions
              </label>
              {formData.follow_up_actions.map((action, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={action}
                    onChange={(e) => handleArrayFieldChange('follow_up_actions', index, e.target.value)}
                    placeholder="Enter a follow-up action or commitment"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                  />
                  {formData.follow_up_actions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayFieldItem('follow_up_actions', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayFieldItem('follow_up_actions')}
                className="text-sg-primary hover:text-sg-primary/80 text-sm"
              >
                + Add Follow-up Action
              </button>
            </div>

            {/* Contact Details */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.contact_details.name}
                    onChange={(e) => handleContactDetailsChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.contact_details.email}
                    onChange={(e) => handleContactDetailsChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.contact_details.phone}
                    onChange={(e) => handleContactDetailsChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                  <input
                    type="text"
                    value={formData.contact_details.organization}
                    onChange={(e) => handleContactDetailsChange('organization', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <input
                    type="text"
                    value={formData.contact_details.position}
                    onChange={(e) => handleContactDetailsChange('position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={formData.contact_details.linkedin}
                    onChange={(e) => handleContactDetailsChange('linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.contact_details.notes}
                  onChange={(e) => handleContactDetailsChange('notes', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.name)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      formData.tags.includes(tag.name)
                        ? 'bg-sg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Relationship Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship Stage
                </label>
                <select
                  value={formData.relationship_stage}
                  onChange={(e) => handleInputChange('relationship_stage', e.target.value as RelationshipStage)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                >
                  <option value="initial_contact">Initial Contact</option>
                  <option value="active_engagement">Active Engagement</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="partnership">Partnership</option>
                  <option value="stagnant">Stagnant</option>
                  <option value="at_risk">At Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Score: {formData.health_score}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.health_score}
                  onChange={(e) => handleInputChange('health_score', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interaction Quality
                </label>
                <select
                  value={formData.interaction_quality}
                  onChange={(e) => handleInputChange('interaction_quality', e.target.value as InteractionQuality)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="neutral">Neutral</option>
                  <option value="poor">Poor</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outcome Rating (1-5)
                </label>
                <select
                  value={formData.outcome_rating}
                  onChange={(e) => handleInputChange('outcome_rating', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                >
                  <option value={1}>1 - Poor</option>
                  <option value={2}>2 - Below Average</option>
                  <option value={3}>3 - Average</option>
                  <option value={4}>4 - Good</option>
                  <option value={5}>5 - Excellent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stakeholder Type
                </label>
                <select
                  value={formData.stakeholder_type || ''}
                  onChange={(e) => handleInputChange('stakeholder_type', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                >
                  <option value="">Select Type</option>
                  <option value="funder">Funder</option>
                  <option value="partner">Partner</option>
                  <option value="community">Community</option>
                  <option value="government">Government</option>
                  <option value="media">Media</option>
                  <option value="academic">Academic</option>
                  <option value="industry">Industry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={formData.priority_level}
                  onChange={(e) => handleInputChange('priority_level', e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sg-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Visibility */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => handleInputChange('is_public', e.target.checked)}
                className="h-4 w-4 text-sg-primary focus:ring-sg-primary border-gray-300 rounded"
              />
              <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                Make this event visible to all team members (read-only)
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-sg-primary text-white rounded-md hover:bg-sg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

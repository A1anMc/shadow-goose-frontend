import React, { useState } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  isRequired: boolean;
}

interface UserOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [userPreferences, setUserPreferences] = useState({
    industry: '',
    location: '',
    fundingRange: { min: 10000, max: 100000 },
    notifications: true,
    emailUpdates: true,
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to SGE V3 GIIS',
      description: 'Let\'s get you set up to discover and manage grants effectively.',
      component: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            SGE V3 GIIS helps you discover, track, and manage grants with AI-powered insights and relationship management.
          </p>
        </div>
      ),
      isRequired: false,
    },
    {
      id: 'industry',
      title: 'Your Industry Focus',
      description: 'Tell us about your industry to get personalized grant recommendations.',
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {['Film', 'Arts', 'Documentary', 'Media', 'Technology', 'Education', 'Healthcare', 'Environment'].map((industry) => (
              <button
                key={industry}
                onClick={() => setUserPreferences(prev => ({ ...prev, industry }))}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  userPreferences.industry === industry
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{industry}</div>
              </button>
            ))}
          </div>
        </div>
      ),
      isRequired: true,
    },
    {
      id: 'location',
      title: 'Your Location',
      description: 'Where are you based? This helps us find location-specific grants.',
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'].map((location) => (
              <button
                key={location}
                onClick={() => setUserPreferences(prev => ({ ...prev, location }))}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  userPreferences.location === location
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{location}</div>
              </button>
            ))}
          </div>
        </div>
      ),
      isRequired: true,
    },
    {
      id: 'funding',
      title: 'Funding Range',
      description: 'What funding range are you looking for?',
      component: (
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Minimum Amount: ${userPreferences.fundingRange.min.toLocaleString()}
            </label>
            <input
              type="range"
              min="1000"
              max="500000"
              step="1000"
              value={userPreferences.fundingRange.min}
              onChange={(e) => setUserPreferences(prev => ({
                ...prev,
                fundingRange: { ...prev.fundingRange, min: parseInt(e.target.value) }
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Maximum Amount: ${userPreferences.fundingRange.max.toLocaleString()}
            </label>
            <input
              type="range"
              min="1000"
              max="1000000"
              step="1000"
              value={userPreferences.fundingRange.max}
              onChange={(e) => setUserPreferences(prev => ({
                ...prev,
                fundingRange: { ...prev.fundingRange, max: parseInt(e.target.value) }
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      ),
      isRequired: false,
    },
    {
      id: 'notifications',
      title: 'Notification Preferences',
      description: 'Stay updated with new grants and important deadlines.',
      component: (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">In-app Notifications</h3>
              <p className="text-sm text-gray-600">Get notified about new grants and deadlines</p>
            </div>
            <button
              onClick={() => setUserPreferences(prev => ({ ...prev, notifications: !prev.notifications }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                userPreferences.notifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  userPreferences.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Email Updates</h3>
              <p className="text-sm text-gray-600">Receive weekly summaries and updates</p>
            </div>
            <button
              onClick={() => setUserPreferences(prev => ({ ...prev, emailUpdates: !prev.emailUpdates }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                userPreferences.emailUpdates ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  userPreferences.emailUpdates ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      ),
      isRequired: false,
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Your preferences have been saved. Let\'s start discovering grants!',
      component: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Setup Complete!</h2>
          <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
            <h3 className="font-medium text-gray-900 mb-2">Your Preferences:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Industry: {userPreferences.industry || 'Not specified'}</li>
              <li>• Location: {userPreferences.location || 'Not specified'}</li>
              <li>• Funding Range: ${userPreferences.fundingRange.min.toLocaleString()} - ${userPreferences.fundingRange.max.toLocaleString()}</li>
              <li>• Notifications: {userPreferences.notifications ? 'Enabled' : 'Disabled'}</li>
            </ul>
          </div>
        </div>
      ),
      isRequired: false,
    },
  ];

  const handleNext = () => {
    const currentStepData = steps[currentStep];
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const canProceed = () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData.isRequired) return true;
    
    switch (currentStepData.id) {
      case 'industry':
        return userPreferences.industry !== '';
      case 'location':
        return userPreferences.location !== '';
      default:
        return true;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Setup Your Account</h1>
            <button
              onClick={handleSkip}
              className="text-blue-100 hover:text-white text-sm"
            >
              Skip Setup
            </button>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-blue-100 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="min-h-[300px] flex items-center justify-center">
            {steps[currentStep].component}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                currentStep === 0
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                canProceed()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOnboarding;

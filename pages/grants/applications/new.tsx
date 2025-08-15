import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getBranding } from "../../../src/lib/branding";
import {
  grantService,
  Grant,
  GrantApplication,
} from "../../../src/lib/grants";
import { aiWritingAssistant } from "../../../src/lib/ai-writing-assistant";

export default function NewGrantApplication() {
  const router = useRouter();
  const { grantId } = router.query;
  const branding = getBranding();

  const [grant, setGrant] = useState<Grant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<string>("overview");

  // Application form state
  const [application, setApplication] = useState({
    project_title: "",
    project_description: "",
    objectives: "",
    methodology: "",
    timeline: "",
    budget: "",
    outcomes: "",
    team_qualifications: "",
    risk_management: "",
    sustainability: "",
  });

  // AI assistance state
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => {
    if (grantId && typeof grantId === "string") {
      loadGrantData(parseInt(grantId));
    }
  }, [grantId]);

  const loadGrantData = async (id: number) => {
    try {
      setLoading(true);
      const grantData = await grantService.getGrant(id);
      setGrant(grantData);
    } catch (error) {
      console.error("Error loading grant:", error);
      setError("Failed to load grant data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setApplication(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getAISuggestion = async (field: string, context: string) => {
    if (!aiEnabled || !grant) return;

    try {
      setAiLoading(prev => ({ ...prev, [field]: true }));
      
      const suggestion = await aiWritingAssistant.generateGrantContent({
        section: field,
        grant_context: {
          name: grant.name,
          description: grant.description,
          category: grant.category,
          amount: grant.amount,
          requirements: grant.requirements || [],
          eligibility: grant.eligibility || []
        },
        existing_content: application[field as keyof typeof application] || "",
        user_context: context
      });

      setAiSuggestions(prev => ({
        ...prev,
        [field]: suggestion
      }));
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
    } finally {
      setAiLoading(prev => ({ ...prev, [field]: false }));
    }
  };

  const applyAISuggestion = (field: string) => {
    const suggestion = aiSuggestions[field];
    if (suggestion) {
      setApplication(prev => ({
        ...prev,
        [field]: suggestion
      }));
      setAiSuggestions(prev => {
        const newSuggestions = { ...prev };
        delete newSuggestions[field];
        return newSuggestions;
      });
    }
  };

  const handleSave = async () => {
    if (!grant) return;

    try {
      setSaving(true);
      const newApplication = await grantService.createApplication(grant.id as number);
      
      if (newApplication) {
        // Save the application content
        await grantService.updateApplicationContent(newApplication.id, application);
        router.push(`/grants/applications/${newApplication.id}`);
      }
    } catch (error) {
      console.error("Error saving application:", error);
      setError("Failed to save application");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grant details...</p>
        </div>
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Grant Not Found</h2>
          <p className="text-gray-600 mb-4">The grant you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push("/grants")}
            className="bg-sg-primary text-white px-6 py-2 rounded-md hover:bg-sg-primary/90"
          >
            Back to Grants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                New Grant Application
              </h1>
              <p className="text-gray-600 mt-1">
                {grant.name} - {formatCurrency(grant.amount)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ai-enabled"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-sg-primary focus:ring-sg-primary"
                />
                <label htmlFor="ai-enabled" className="text-sm text-gray-700">
                  AI Writing Assistant
                </label>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-sg-accent text-white px-6 py-2 rounded-md hover:bg-sg-accent/90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Application"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Grant Information Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Grant Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{grant.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{grant.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <p className="font-medium text-sg-primary">{formatCurrency(grant.amount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <p className="font-medium">{grant.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Deadline:</span>
                    <p className="font-medium">{formatDate(grant.deadline)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className="font-medium">{grant.status}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Eligibility Requirements</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {grant.eligibility.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {grant.requirements && grant.requirements.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Required Documents</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {grant.requirements.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-blue-500 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {/* Form Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "project", label: "Project Details" },
                    { id: "methodology", label: "Methodology" },
                    { id: "budget", label: "Budget & Timeline" },
                    { id: "team", label: "Team & Outcomes" },
                  ].map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeSection === section.id
                          ? "border-sg-primary text-sg-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {activeSection === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Project Overview
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Title *
                          </label>
                          <input
                            type="text"
                            value={application.project_title}
                            onChange={(e) => handleInputChange("project_title", e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                            placeholder="Enter your project title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Description *
                          </label>
                          <div className="relative">
                            <textarea
                              value={application.project_description}
                              onChange={(e) => handleInputChange("project_description", e.target.value)}
                              rows={6}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                              placeholder="Describe your project in detail..."
                            />
                            {aiEnabled && (
                              <button
                                onClick={() => getAISuggestion("project_description", "Write a compelling project description")}
                                disabled={aiLoading.project_description}
                                className="absolute top-2 right-2 p-2 text-sg-primary hover:bg-sg-primary/10 rounded-md disabled:opacity-50"
                              >
                                {aiLoading.project_description ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sg-primary"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                          {aiSuggestions.project_description && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800 mb-2">AI Suggestion:</p>
                              <p className="text-sm text-blue-700 mb-2">{aiSuggestions.project_description}</p>
                              <button
                                onClick={() => applyAISuggestion("project_description")}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Apply Suggestion
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Objectives *
                          </label>
                          <div className="relative">
                            <textarea
                              value={application.objectives}
                              onChange={(e) => handleInputChange("objectives", e.target.value)}
                              rows={4}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                              placeholder="What are the main objectives of your project?"
                            />
                            {aiEnabled && (
                              <button
                                onClick={() => getAISuggestion("objectives", "Write clear project objectives")}
                                disabled={aiLoading.objectives}
                                className="absolute top-2 right-2 p-2 text-sg-primary hover:bg-sg-primary/10 rounded-md disabled:opacity-50"
                              >
                                {aiLoading.objectives ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sg-primary"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                          {aiSuggestions.objectives && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800 mb-2">AI Suggestion:</p>
                              <p className="text-sm text-blue-700 mb-2">{aiSuggestions.objectives}</p>
                              <button
                                onClick={() => applyAISuggestion("objectives")}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Apply Suggestion
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "project" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Project Details
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Methodology *
                          </label>
                          <div className="relative">
                            <textarea
                              value={application.methodology}
                              onChange={(e) => handleInputChange("methodology", e.target.value)}
                              rows={6}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                              placeholder="Describe your project methodology and approach..."
                            />
                            {aiEnabled && (
                              <button
                                onClick={() => getAISuggestion("methodology", "Write a detailed methodology section")}
                                disabled={aiLoading.methodology}
                                className="absolute top-2 right-2 p-2 text-sg-primary hover:bg-sg-primary/10 rounded-md disabled:opacity-50"
                              >
                                {aiLoading.methodology ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sg-primary"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                          {aiSuggestions.methodology && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800 mb-2">AI Suggestion:</p>
                              <p className="text-sm text-blue-700 mb-2">{aiSuggestions.methodology}</p>
                              <button
                                onClick={() => applyAISuggestion("methodology")}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Apply Suggestion
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Outcomes *
                          </label>
                          <div className="relative">
                            <textarea
                              value={application.outcomes}
                              onChange={(e) => handleInputChange("outcomes", e.target.value)}
                              rows={4}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                              placeholder="What outcomes do you expect from this project?"
                            />
                            {aiEnabled && (
                              <button
                                onClick={() => getAISuggestion("outcomes", "Write expected project outcomes")}
                                disabled={aiLoading.outcomes}
                                className="absolute top-2 right-2 p-2 text-sg-primary hover:bg-sg-primary/10 rounded-md disabled:opacity-50"
                              >
                                {aiLoading.outcomes ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sg-primary"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                          {aiSuggestions.outcomes && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800 mb-2">AI Suggestion:</p>
                              <p className="text-sm text-blue-700 mb-2">{aiSuggestions.outcomes}</p>
                              <button
                                onClick={() => applyAISuggestion("outcomes")}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Apply Suggestion
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "methodology" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Implementation & Risk Management
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Risk Management *
                          </label>
                          <div className="relative">
                            <textarea
                              value={application.risk_management}
                              onChange={(e) => handleInputChange("risk_management", e.target.value)}
                              rows={4}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                              placeholder="Describe your risk management strategies..."
                            />
                            {aiEnabled && (
                              <button
                                onClick={() => getAISuggestion("risk_management", "Write risk management strategies")}
                                disabled={aiLoading.risk_management}
                                className="absolute top-2 right-2 p-2 text-sg-primary hover:bg-sg-primary/10 rounded-md disabled:opacity-50"
                              >
                                {aiLoading.risk_management ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sg-primary"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                          {aiSuggestions.risk_management && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800 mb-2">AI Suggestion:</p>
                              <p className="text-sm text-blue-700 mb-2">{aiSuggestions.risk_management}</p>
                              <button
                                onClick={() => applyAISuggestion("risk_management")}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Apply Suggestion
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sustainability *
                          </label>
                          <div className="relative">
                            <textarea
                              value={application.sustainability}
                              onChange={(e) => handleInputChange("sustainability", e.target.value)}
                              rows={4}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                              placeholder="How will your project be sustainable beyond the grant period?"
                            />
                            {aiEnabled && (
                              <button
                                onClick={() => getAISuggestion("sustainability", "Write sustainability plan")}
                                disabled={aiLoading.sustainability}
                                className="absolute top-2 right-2 p-2 text-sg-primary hover:bg-sg-primary/10 rounded-md disabled:opacity-50"
                              >
                                {aiLoading.sustainability ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sg-primary"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                          {aiSuggestions.sustainability && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800 mb-2">AI Suggestion:</p>
                              <p className="text-sm text-blue-700 mb-2">{aiSuggestions.sustainability}</p>
                              <button
                                onClick={() => applyAISuggestion("sustainability")}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Apply Suggestion
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "budget" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Budget & Timeline
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget Breakdown *
                          </label>
                          <div className="relative">
                            <textarea
                              value={application.budget}
                              onChange={(e) => handleInputChange("budget", e.target.value)}
                              rows={6}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                              placeholder="Provide a detailed budget breakdown..."
                            />
                            {aiEnabled && (
                              <button
                                onClick={() => getAISuggestion("budget", "Write budget breakdown for grant")}
                                disabled={aiLoading.budget}
                                className="absolute top-2 right-2 p-2 text-sg-primary hover:bg-sg-primary/10 rounded-md disabled:opacity-50"
                              >
                                {aiLoading.budget ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sg-primary"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                          {aiSuggestions.budget && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800 mb-2">AI Suggestion:</p>
                              <p className="text-sm text-blue-700 mb-2">{aiSuggestions.budget}</p>
                              <button
                                onClick={() => applyAISuggestion("budget")}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Apply Suggestion
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Timeline *
                          </label>
                          <div className="relative">
                            <textarea
                              value={application.timeline}
                              onChange={(e) => handleInputChange("timeline", e.target.value)}
                              rows={4}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                              placeholder="Describe your project timeline and milestones..."
                            />
                            {aiEnabled && (
                              <button
                                onClick={() => getAISuggestion("timeline", "Write project timeline")}
                                disabled={aiLoading.timeline}
                                className="absolute top-2 right-2 p-2 text-sg-primary hover:bg-sg-primary/10 rounded-md disabled:opacity-50"
                              >
                                {aiLoading.timeline ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sg-primary"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                          {aiSuggestions.timeline && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800 mb-2">AI Suggestion:</p>
                              <p className="text-sm text-blue-700 mb-2">{aiSuggestions.timeline}</p>
                              <button
                                onClick={() => applyAISuggestion("timeline")}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Apply Suggestion
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "team" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Team & Qualifications
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Team Qualifications *
                          </label>
                          <div className="relative">
                            <textarea
                              value={application.team_qualifications}
                              onChange={(e) => handleInputChange("team_qualifications", e.target.value)}
                              rows={6}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                              placeholder="Describe your team's qualifications and experience..."
                            />
                            {aiEnabled && (
                              <button
                                onClick={() => getAISuggestion("team_qualifications", "Write team qualifications")}
                                disabled={aiLoading.team_qualifications}
                                className="absolute top-2 right-2 p-2 text-sg-primary hover:bg-sg-primary/10 rounded-md disabled:opacity-50"
                              >
                                {aiLoading.team_qualifications ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sg-primary"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                          {aiSuggestions.team_qualifications && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800 mb-2">AI Suggestion:</p>
                              <p className="text-sm text-blue-700 mb-2">{aiSuggestions.team_qualifications}</p>
                              <button
                                onClick={() => applyAISuggestion("team_qualifications")}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Apply Suggestion
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import GrantProjectManager from "../../../src/components/GrantProjectManager";
import GrantWritingAssistant from "../../../src/components/GrantWritingAssistant";
import { aiWritingAssistant } from "../../../src/lib/ai-writing-assistant";
import { getBranding } from "../../../src/lib/branding";
import { getGrantsService } from "../../../src/lib/services/grants-service";
import {
    Grant,
} from "../../../src/lib/types/grants";

// Professional grant application templates
const GRANT_TEMPLATES = {
  'arts_culture': {
    name: 'Arts & Culture Template',
    sections: {
      project_description: 'Our project will create innovative arts experiences that engage diverse communities and tell important Australian stories. We will collaborate with local artists, cultural organizations, and community groups to develop programming that reflects the unique character and heritage of our region.',
      objectives: '1. Create 10 new arts experiences reaching 5,000+ community members\n2. Provide professional development for 20 local artists\n3. Establish 3 new community partnerships\n4. Document and share best practices for community arts engagement',
      methodology: 'We will use a collaborative, community-driven approach including artist residencies, workshops, public performances, and digital documentation. Our methodology emphasizes local engagement, cultural sensitivity, and sustainable impact.',
      timeline: 'Month 1-2: Planning and partnership development\nMonth 3-6: Artist recruitment and program design\nMonth 7-10: Implementation and community engagement\nMonth 11-12: Evaluation and documentation',
      budget: 'Artist fees: $8,000\nMaterials and equipment: $3,000\nVenue and logistics: $2,000\nMarketing and documentation: $1,500\nAdministration: $500',
      outcomes: 'Increased community arts participation, strengthened local arts sector, documented best practices, and established sustainable partnerships for future arts programming.',
      team_qualifications: 'Our team includes experienced arts administrators, community engagement specialists, and local artists with proven track records in successful grant-funded projects.',
      risk_management: 'We have identified potential risks including weather impacts on outdoor events, artist availability, and community engagement challenges. Mitigation strategies include backup venues, flexible scheduling, and robust community consultation processes.',
      sustainability: 'This project will establish lasting partnerships and infrastructure that will continue to benefit the community beyond the grant period. We will develop ongoing funding strategies and volunteer programs.'
    }
  },
  'documentary': {
    name: 'Documentary Production Template',
    sections: {
      project_description: 'We will produce a compelling documentary that explores important social issues through authentic storytelling and innovative filmmaking techniques. Our approach combines traditional documentary methods with modern digital storytelling to reach diverse audiences.',
      objectives: '1. Complete a 60-minute documentary film\n2. Conduct 50+ interviews with key stakeholders\n3. Create 10 short-form digital content pieces\n4. Reach 100,000+ viewers through multiple platforms',
      methodology: 'Our methodology includes extensive research, stakeholder consultation, multi-platform filming, collaborative editing processes, and strategic distribution planning.',
      timeline: 'Month 1-3: Research and pre-production\nMonth 4-8: Filming and interviews\nMonth 9-11: Post-production and editing\nMonth 12: Distribution and promotion',
      budget: 'Equipment and filming: $20,000\nPost-production: $15,000\nTravel and logistics: $8,000\nMarketing and distribution: $5,000\nAdministration: $2,000',
      outcomes: 'A professionally produced documentary that raises awareness, influences public discourse, and creates lasting impact through multiple distribution channels.',
      team_qualifications: 'Our production team includes award-winning filmmakers, experienced researchers, and distribution specialists with proven success in documentary production.',
      risk_management: 'We have contingency plans for equipment failure, scheduling conflicts, and distribution challenges. Our risk management includes backup equipment, flexible scheduling, and multiple distribution strategies.',
      sustainability: 'The documentary will have ongoing impact through educational use, continued distribution, and potential for follow-up projects or series development.'
    }
  },
  'community': {
    name: 'Community Development Template',
    sections: {
      project_description: 'Our community development project will address critical local needs through collaborative, evidence-based interventions that build community capacity and create lasting positive change.',
      objectives: '1. Engage 200+ community members in program development\n2. Implement 5 community-led initiatives\n3. Train 30 community leaders\n4. Create sustainable community infrastructure',
      methodology: 'We use a participatory action research approach, community consultation, capacity building, and collaborative implementation with ongoing evaluation and adaptation.',
      timeline: 'Month 1-2: Community consultation and needs assessment\nMonth 3-6: Program development and training\nMonth 7-10: Implementation and monitoring\nMonth 11-12: Evaluation and sustainability planning',
      budget: 'Community engagement: $6,000\nProgram delivery: $5,000\nTraining and capacity building: $3,000\nEvaluation and documentation: $1,000',
      outcomes: 'Strengthened community networks, increased local capacity, sustainable community programs, and documented best practices for community development.',
      team_qualifications: 'Our team includes community development specialists, social workers, and local community leaders with extensive experience in successful community projects.',
      risk_management: 'We address risks through comprehensive community consultation, flexible program design, strong partnerships, and ongoing monitoring and evaluation.',
      sustainability: 'This project will establish sustainable community structures, ongoing partnerships, and capacity that will continue to benefit the community long-term.'
    }
  }
};

export default function NewGrantApplication() {
  const router = useRouter();
  const { grantId } = router.query;
  const branding = getBranding();

  const [grant, setGrant] = useState<Grant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [showTemplates, setShowTemplates] = useState(false);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [writingTips, setWritingTips] = useState<string[]>([]);

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
  const [smartSuggestions, setSmartSuggestions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (grantId && typeof grantId === "string") {
      loadGrantData(grantId);
    }
  }, [grantId]);

  useEffect(() => {
    // Calculate completion progress
    const fields = Object.values(application);
    const completedFields = fields.filter(field => field.trim().length > 0).length;
    const progress = Math.round((completedFields / fields.length) * 100);
    setCompletionProgress(progress);

    // Generate writing tips based on grant type
    if (grant) {
      generateWritingTips();
    }
  }, [application, grant]);

  const loadGrantData = async (id: string | number) => {
    try {
      setLoading(true);
      const grantsService = getGrantsService();
      const grantData = await grantsService.getGrant(parseInt(id as string));
      setGrant(grantData);

      // Pre-fill with smart suggestions based on grant type
      if (grantData) {
        prefillSmartSuggestions(grantData);
      }
    } catch (error) {
      console.error("Error loading grant:", error);
      setError("Failed to load grant data");
    } finally {
      setLoading(false);
    }
  };

  const prefillSmartSuggestions = (grantData: Grant) => {
    const category = grantData.category;
    const template = GRANT_TEMPLATES[category as keyof typeof GRANT_TEMPLATES];

    if (template) {
      setSmartSuggestions({
        project_title: [
          `${category.charAt(0).toUpperCase() + category.slice(1)} Project: [Your Project Name]`,
          `Innovative ${category} Initiative`,
          `Community ${category} Program`
        ],
        project_description: [template.sections.project_description],
        objectives: [template.sections.objectives],
        methodology: [template.sections.methodology],
        timeline: [template.sections.timeline],
        budget: [template.sections.budget],
        outcomes: [template.sections.outcomes],
        team_qualifications: [template.sections.team_qualifications],
        risk_management: [template.sections.risk_management],
        sustainability: [template.sections.sustainability]
      });
    }
  };

  const generateWritingTips = () => {
    if (!grant) return;

    const tips = [
      "Use specific, measurable objectives with clear timelines",
      "Include quantifiable outcomes and impact metrics",
      "Demonstrate alignment with grant requirements",
      "Show evidence of community need and support",
      "Provide detailed budget breakdown with justification",
      "Address potential risks and mitigation strategies",
      "Explain how the project will be sustainable beyond funding"
    ];

    setWritingTips(tips);
  };

  const applyTemplate = (templateKey: string) => {
    const template = GRANT_TEMPLATES[templateKey as keyof typeof GRANT_TEMPLATES];
    if (template) {
      setApplication(prev => ({
        ...prev,
        ...template.sections
      }));
      setShowTemplates(false);
    }
  };

  const applySmartSuggestion = (field: string, suggestion: string) => {
    setApplication(prev => ({
      ...prev,
      [field]: suggestion
    }));
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

      const response = await aiWritingAssistant.generateGrantContent({
        section: field,
        grant_context: {
          name: grant.title,
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
        [field]: response.content
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
      const grantsService = getGrantsService();
      const newApplication = await grantsService.createGrantApplication({ grant_id: grant.id as number });

      if (newApplication) {
        // Save the application content
        const grantsService = getGrantsService();
        await grantsService.updateApplicationContent(newApplication.id, application);
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
                {grant.title} - {formatCurrency(grant.amount)}
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
                  <h4 className="font-medium text-gray-900">{grant.title}</h4>
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

                {/* Application Progress */}
                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Application Progress</h5>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-sg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{completionProgress}% complete</p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Eligibility Requirements</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {grant.eligibility_criteria?.map((item, index) => (
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

                {/* Writing Tips */}
                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Writing Tips</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {writingTips.slice(0, 3).map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-sg-primary mr-2 mt-1">💡</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Template Selection */}
                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Smart Templates</h5>
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="w-full bg-sg-primary text-white px-4 py-2 rounded-md hover:bg-sg-primary/90 transition-colors text-sm"
                  >
                    {showTemplates ? 'Hide Templates' : 'Show Templates'}
                  </button>

                  {showTemplates && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(GRANT_TEMPLATES).map(([key, template]) => (
                        <button
                          key={key}
                          onClick={() => applyTemplate(key)}
                          className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm"
                        >
                          <div className="font-medium text-gray-900">{template.name}</div>
                          <div className="text-gray-600 text-xs mt-1">Click to apply template</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                    { id: "management", label: "Project Management" },
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
                          <div className="relative">
                            <input
                              type="text"
                              value={application.project_title}
                              onChange={(e) => handleInputChange("project_title", e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                              placeholder="Enter your project title"
                            />
                            {smartSuggestions.project_title && (
                              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                                {smartSuggestions.project_title.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() => applySmartSuggestion("project_title", suggestion)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
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
                            <div className="absolute top-2 right-2 flex space-x-1">
                              {smartSuggestions.project_description && (
                                <button
                                  onClick={() => applySmartSuggestion("project_description", smartSuggestions.project_description[0])}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-md text-xs font-medium"
                                  title="Apply Smart Suggestion"
                                >
                                  💡 Smart
                                </button>
                              )}
                              {aiEnabled && (
                                <button
                                  onClick={() => getAISuggestion("project_description", "Write a compelling project description")}
                                  disabled={aiLoading.project_description}
                                  className="p-2 text-sg-primary hover:bg-sg-primary/10 rounded-md disabled:opacity-50"
                                  title="Get AI Suggestion"
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
                            <div className="absolute top-2 right-2 flex space-x-1">
                              {smartSuggestions.objectives && (
                                <button
                                  onClick={() => applySmartSuggestion("objectives", smartSuggestions.objectives[0])}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-md text-xs font-medium"
                                  title="Apply Smart Suggestion"
                                >
                                  💡 Smart
                                </button>
                              )}
                              {aiEnabled && (
                                <button
                                  onClick={() => getAISuggestion("objectives", "Write clear project objectives")}
                                  disabled={aiLoading.objectives}
                                  className="p-2 text-sg-primary hover:bg-sg-primary/10 rounded-md disabled:opacity-50"
                                  title="Get AI Suggestion"
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

                {activeSection === "management" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Project Management
                      </h3>
                      <GrantProjectManager
                        applicationId={parseInt(grantId as string)}
                        grant={grant}
                        onUpdate={() => {
                          // Refresh data when project management updates
                          console.log('Project management updated');
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grant Writing Assistant */}
      {grant && (
        <GrantWritingAssistant
          grant={grant}
          application={application}
          onContentUpdate={handleInputChange}
          currentField={activeSection}
        />
      )}
    </div>
  );
}

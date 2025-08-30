import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getBranding } from "../../../src/lib/branding";
import { getGrantsService } from "../../../src/lib/services/grants-service";

import { logger } from '../../../src/lib/logger';
import {
    Grant,
    GrantAnswer,
    GrantApplication,
    GrantComment,
} from "../../../src/lib/types/grants";

export default function GrantApplicationDetail() {
  const router = useRouter();
  const { id } = router.query;
  const branding = getBranding();

  const [application, setApplication] = useState<GrantApplication | null>(null);
  const [grant, setGrant] = useState<Grant | null>(null);
  const [answers, setAnswers] = useState<GrantAnswer[]>([]);
  const [comments, setComments] = useState<GrantComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "answers" | "comments" | "submit">("overview");

  useEffect(() => {
    if (id && typeof id === "string") {
      loadApplicationData(id);
    }
  }, [id]);

  const loadApplicationData = async (applicationId: string) => {
    try {
      setLoading(true);
      const grantsService = getGrantsService();
      const [appData, answersData, commentsData] = await Promise.all([
        grantsService.getApplication(parseInt(applicationId)),
        grantsService.getApplicationAnswers(parseInt(applicationId)),
        grantsService.getApplicationComments(parseInt(applicationId)),
      ]);

      if (appData) {
        setApplication(appData);
        // Load the associated grant
        const grantData = await grantsService.getGrant(appData.grant_id);
        setGrant(grantData);
      }

      setAnswers(answersData || []);
      setComments(commentsData || []);
    } catch (error) {
      logger.error("Error loading application:", error);
      setError("Failed to load application data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnswer = async (question: string) => {
    if (!application || !newAnswer.trim()) return;

    try {
      setSaving(true);
      const grantsService = getGrantsService();
      const answer = await grantsService.updateApplicationAnswer(
        application.id,
        { question, answer: newAnswer, author: "SGE Team" }
      );

      if (answer) {
        setAnswers(prev => [...prev, answer]);
        setNewAnswer("");
      }
    } catch (error) {
      logger.error("Error saving answer:", error);
      setError("Failed to save answer");
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!application || !newComment.trim()) return;

    try {
      setSaving(true);
      const grantsService = getGrantsService();
      const comment = await grantsService.addComment(
        application.id,
        { comment: newComment, user_id: 1 }
      );

      if (comment) {
        setComments(prev => [...prev, comment]);
        setNewComment("");
      }
    } catch (error) {
      logger.error("Error adding comment:", error);
      setError("Failed to add comment");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!application) return;

    try {
      setSubmitting(true);
      const grantsService = getGrantsService();
      const success = await grantsService.submitApplication(application.id);

      if (success) {
        setApplication(prev => prev ? { ...prev, status: "submitted" } : null);
        setActiveTab("overview");
        alert("Application submitted successfully!");
      }
    } catch (error) {
      logger.error("Error submitting application:", error);
      setError("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "text-gray-600 bg-gray-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "submitted":
        return "text-yellow-600 bg-yellow-100";
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
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
          <p className="mt-4 text-sg-primary">Loading Application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Application Not Found</div>
          <p className="text-gray-600 mb-4">The application you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push("/grants")}
            className="bg-sg-primary text-white px-4 py-2 rounded-md hover:bg-sg-primary/90"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-sg-primary">
                Grant Application: {application.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}
              >
                {application.status.replace("_", " ")}
              </span>
              <button
                onClick={() => router.push("/grants")}
                className="bg-sg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-sg-primary/90"
              >
                Back to Grants
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {["overview", "answers", "comments", "submit"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-sg-primary text-sg-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Application Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Application Title</h3>
                  <p className="mt-1 text-sm text-gray-900">{application.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(application.status)}`}>
                    {application.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(application.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(application.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Grant Details */}
            {grant && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Grant Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Grant Title</h3>
                    <p className="mt-1 text-sm text-gray-900">{grant.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(grant.amount)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="mt-1 text-sm text-gray-900">{grant.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Deadline</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(grant.deadline)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-sm text-gray-900">{grant.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-sg-primary">{answers.length}</div>
                  <div className="text-sm text-gray-500">Answers Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sg-primary">{comments.length}</div>
                  <div className="text-sm text-gray-500">Comments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sg-primary">
                    {application.status === "submitted" ? "100%" : "In Progress"}
                  </div>
                  <div className="text-sm text-gray-500">Completion</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "answers" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Answers</h2>

              {/* Sample Questions - In a real app, these would come from the grant */}
              {[
                "Describe your project and its objectives",
                "What is the expected impact of your project?",
                "How will you measure success?",
                "What is your project timeline?",
                "What is your budget breakdown?"
              ].map((question, index) => {
                const existingAnswer = answers.find(a => a.question === question);
                return (
                  <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">{question}</h3>
                    {existingAnswer ? (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-700">{existingAnswer.answer}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Answered by {existingAnswer.author} on {formatDate(existingAnswer.created_at)}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          value={newAnswer}
                          onChange={(e) => setNewAnswer(e.target.value)}
                          placeholder="Enter your answer..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                          rows={4}
                        />
                        <button
                          onClick={() => handleSaveAnswer(question)}
                          disabled={saving || !newAnswer.trim()}
                          className="bg-sg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-sg-primary/90 disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save Answer"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "comments" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Comments</h2>

              {/* Add New Comment */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Add Comment</h3>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment or note..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  disabled={saving || !newComment.trim()}
                  className="mt-2 bg-sg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-sg-primary/90 disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add Comment"}
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        By {comment.user_id} on {formatDate(comment.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "submit" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Application</h2>

              {application.status === "submitted" ? (
                <div className="text-center py-8">
                  <div className="text-green-600 text-4xl mb-4">✅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Application Submitted</h3>
                  <p className="text-gray-600">Your application has been successfully submitted.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <h3 className="text-sm font-medium text-yellow-800">Before You Submit</h3>
                    <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                      <li>Ensure all required questions are answered</li>
                      <li>Review your answers for accuracy</li>
                      <li>Make sure your budget aligns with the grant amount</li>
                      <li>Check that your timeline is realistic</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Submission Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Answers Completed:</span>
                        <span className="ml-2 font-medium">{answers.length}/5</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Team Comments:</span>
                        <span className="ml-2 font-medium">{comments.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Grant Amount:</span>
                        <span className="ml-2 font-medium">{grant ? formatCurrency(grant.amount) : "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Deadline:</span>
                        <span className="ml-2 font-medium">{grant ? formatDate(grant.deadline) : "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitApplication}
                    disabled={submitting || (application.status as string) === "submitted" || application.status === "approved" || application.status === "rejected"}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

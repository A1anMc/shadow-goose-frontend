import { useCallback, useEffect, useState } from 'react';
import { getGrantsService } from '../lib/services/grants-service';
import { ApplicationProgress, Collaborator, GrantQuestion, TeamAssignment } from '../lib/types/grants';

interface GrantProjectManagerProps {
  applicationId: number;
  grant: any;
  onUpdate: () => void;
}

export default function GrantProjectManager({ applicationId, grant, onUpdate }: GrantProjectManagerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'team' | 'collaborators' | 'progress' | 'project'>('overview');
  const [questions, setQuestions] = useState<GrantQuestion[]>([]);
  const [teamAssignments, setTeamAssignments] = useState<TeamAssignment[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [progress, setProgress] = useState<ApplicationProgress | null>(null);
  const [availableTeamMembers, setAvailableTeamMembers] = useState<Array<{ id: number; name: string; email: string; skills: string[]; availability: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<GrantQuestion | null>(null);

  const loadProjectData = useCallback(async () => {
    try {
      setLoading(true);
      const grantsService = getGrantsService();
      const [
        questionsData,
        assignmentsData,
        collaboratorsData,
        progressData,
        teamMembersData
      ] = await Promise.all([
        grantsService.getApplicationQuestions(applicationId),
        grantsService.getTeamAssignments(applicationId),
        grantsService.getCollaborators(applicationId),
        grantsService.getApplicationProgress(applicationId),
        grantsService.getAvailableTeamMembers()
      ]);

      setQuestions(questionsData);
      setTeamAssignments(assignmentsData);
      setCollaborators(collaboratorsData);
      setProgress(progressData);
      setAvailableTeamMembers(teamMembersData);
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);



  const assignTeamMember = async (questionId: string, userId: number, role: string) => {
    try {
      const grantsService = getGrantsService();
      const assignment = await grantsService.assignTeamMember(applicationId, {
        question_id: questionId,
        user_id: userId,
        role: role as any,
        responsibilities: [`Write and review content for ${questions.find(q => q.id === questionId)?.question}`],
        permissions: ['edit', 'view']
      });

      if (assignment) {
        setTeamAssignments(prev => [...prev, assignment]);
        onUpdate();
      }
    } catch (error) {
      console.error('Error assigning team member:', error);
    }
  };

  const inviteCollaborator = async (email: string, name: string, role: string) => {
    try {
      const grantsService = getGrantsService();
      const collaborator = await grantsService.inviteCollaborator(applicationId, {
        email,
        name,
        role: role as any,
        permissions: role === 'writer' ? ['edit', 'view'] : ['view']
      });

      if (collaborator) {
        setCollaborators(prev => [...prev, collaborator]);
        onUpdate();
      }
    } catch (error) {
      console.error('Error inviting collaborator:', error);
    }
  };

  const updateQuestionAnswer = async (questionId: string, answer: string) => {
    try {
      const grantsService = getGrantsService();
      const success = await grantsService.updateQuestionAnswer(applicationId, questionId, answer);
      if (success) {
        setQuestions(prev => prev.map(q =>
          q.id === questionId ? { ...q, answer, last_updated: new Date().toISOString() } : q
        ));
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating question answer:', error);
    }
  };

  const getQuestionTypeColor = (type: string) => {
    const colors = {
      budget: 'bg-green-100 text-green-800',
      creative: 'bg-purple-100 text-purple-800',
      impact: 'bg-blue-100 text-blue-800',
      legal: 'bg-red-100 text-red-800',
      technical: 'bg-yellow-100 text-yellow-800',
      general: 'bg-gray-100 text-gray-800',
      methodology: 'bg-indigo-100 text-indigo-800',
      timeline: 'bg-orange-100 text-orange-800',
      team: 'bg-pink-100 text-pink-800',
      sustainability: 'bg-teal-100 text-teal-800'
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      reviewed: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sg-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'questions', label: 'Questions', icon: '❓' },
            { id: 'team', label: 'Team', icon: '👥' },
            { id: 'collaborators', label: 'Collaborators', icon: '🤝' },
            { id: 'progress', label: 'Progress', icon: '📈' },
            { id: 'project', label: 'Project', icon: '🎯' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "border-sg-primary text-sg-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Application Progress</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {progress?.percentage_complete || 0}%
                </div>
                <p className="text-sm text-blue-700">
                  {progress?.completed_questions || 0} of {progress?.total_questions || 0} questions complete
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Team Members</h3>
                <div className="text-3xl font-bold text-green-600">
                  {teamAssignments.length}
                </div>
                <p className="text-sm text-green-700">
                  {teamAssignments.filter(a => a.status === 'completed').length} assignments completed
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Collaborators</h3>
                <div className="text-3xl font-bold text-purple-600">
                  {collaborators.length}
                </div>
                <p className="text-sm text-purple-700">
                  {collaborators.filter(c => c.accepted_at).length} accepted invitations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {questions
                    .filter(q => q.last_updated)
                    .sort((a, b) => new Date(b.last_updated!).getTime() - new Date(a.last_updated!).getTime())
                    .slice(0, 5)
                    .map(question => (
                      <div key={question.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full ${question.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{question.question}</p>
                          <p className="text-xs text-gray-500">
                            Updated {new Date(question.last_updated!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
                <div className="space-y-3">
                  {questions
                    .filter(q => q.status === 'pending' || q.status === 'in_progress')
                    .slice(0, 5)
                    .map(question => (
                      <div key={question.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-red-900">{question.question}</p>
                          <p className="text-xs text-red-700">Needs attention</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedQuestion(question);
                            setActiveTab('questions');
                          }}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Work on it
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Application Questions</h3>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="bg-sg-primary text-white px-4 py-2 rounded-md hover:bg-sg-primary/90"
              >
                Assign Team Members
              </button>
            </div>

            <div className="space-y-4">
              {questions.map(question => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQuestionTypeColor(question.type)}`}>
                          {question.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}>
                          {question.status.replace('_', ' ')}
                        </span>
                        {question.required && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{question.question}</h4>
                      {question.help_text && (
                        <p className="text-sm text-gray-600 mb-3">{question.help_text}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={question.answer || ''}
                      onChange={(e) => updateQuestionAnswer(question.id, e.target.value)}
                      placeholder="Enter your answer..."
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
                      maxLength={question.max_length}
                    />

                    {question.max_length && (
                      <div className="text-xs text-gray-500 text-right">
                        {(question.answer?.length || 0)} / {question.max_length} characters
                      </div>
                    )}

                    {/* Team Assignment */}
                    {teamAssignments.filter(a => a.question_id === question.id).length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <h5 className="text-sm font-medium text-blue-900 mb-2">Assigned Team Members</h5>
                        <div className="space-y-1">
                          {teamAssignments
                            .filter(a => a.question_id === question.id)
                            .map(assignment => (
                              <div key={assignment.id} className="flex items-center justify-between text-sm">
                                <span className="text-blue-800">
                                  {availableTeamMembers.find(m => m.id === assignment.user_id)?.name || 'Unknown'}
                                  <span className="text-blue-600 ml-2">({assignment.role})</span>
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(assignment.status)}`}>
                                  {assignment.status}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Team Assignments</h3>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="bg-sg-primary text-white px-4 py-2 rounded-md hover:bg-sg-primary/90"
              >
                New Assignment
              </button>
            </div>

            <div className="space-y-4">
              {teamAssignments.map(assignment => {
                const teamMember = availableTeamMembers.find(m => m.id === assignment.user_id);
                const question = questions.find(q => q.id === assignment.question_id);

                return (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{teamMember?.name || 'Unknown'}</h4>
                        <p className="text-sm text-gray-600">{teamMember?.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {assignment.role}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        </div>
                        {question && (
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>Question:</strong> {question.question}
                          </p>
                        )}
                        {assignment.due_date && (
                          <p className="text-sm text-gray-600 mt-1">
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Collaborators Tab */}
        {activeTab === 'collaborators' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Collaborators</h3>
              <button
                onClick={() => setShowCollaboratorModal(true)}
                className="bg-sg-primary text-white px-4 py-2 rounded-md hover:bg-sg-primary/90"
              >
                Invite Collaborator
              </button>
            </div>

            <div className="space-y-4">
              {collaborators.map(collaborator => (
                <div key={collaborator.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{collaborator.name}</h4>
                      <p className="text-sm text-gray-600">{collaborator.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {collaborator.role}
                        </span>
                        {collaborator.accepted_at ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Accepted
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Invited: {new Date(collaborator.invited_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && progress && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Application Progress</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Overall Progress</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completion</span>
                      <span>{progress.percentage_complete}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-sg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage_complete}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Questions:</span>
                      <p className="font-medium">{progress.total_questions}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Completed:</span>
                      <p className="font-medium">{progress.completed_questions}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Section Progress</h4>
                <div className="space-y-3">
                  {progress.sections_complete.map(section => (
                    <div key={section} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm text-green-800">{section}</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  ))}
                  {progress.sections_pending.map(section => (
                    <div key={section} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <span className="text-sm text-yellow-800">{section}</span>
                      <span className="text-yellow-600">⏳</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Tab */}
        {activeTab === 'project' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">Create Project from Application</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Convert this grant application into a full SGE project with team management, timelines, and deliverables.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Create Project
                </button>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">Link to Existing Project</h4>
                <p className="text-sm text-green-700 mb-4">
                  Connect this application to an existing SGE project for integrated management.
                </p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                  Link Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  {questions.map(question => (
                    <option key={question.id} value={question.id}>{question.question}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Member</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  {availableTeamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="writer">Writer</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="approver">Approver</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="bg-sg-primary text-white px-4 py-2 rounded-md hover:bg-sg-primary/90">
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collaborator Modal */}
      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Collaborator</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="writer">Writer</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="approver">Approver</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCollaboratorModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="bg-sg-primary text-white px-4 py-2 rounded-md hover:bg-sg-primary/90">
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

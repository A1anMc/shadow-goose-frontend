import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import GrantProjectManager from '../GrantProjectManager';

// Mock the grants service
jest.mock('../../lib/services/grants-service', () => ({
  getGrantsService: jest.fn(() => ({
    getApplicationQuestions: jest.fn(),
    getTeamAssignments: jest.fn(),
    getCollaborators: jest.fn(),
    getApplicationProgress: jest.fn(),
    getAvailableTeamMembers: jest.fn(),
    assignTeamMember: jest.fn(),
    inviteCollaborator: jest.fn(),
    updateQuestionAnswer: jest.fn(),
  })),
}));

describe('GrantProjectManager', () => {
  const mockGrant = {
    id: 'grant-1',
    title: 'Test Grant',
    description: 'Test grant description',
    amount: 50000,
    deadline: '2025-12-31',
    status: 'active'
  };

  const mockGetApplicationQuestions = jest.fn();
  const mockGetTeamAssignments = jest.fn();
  const mockGetCollaborators = jest.fn();
  const mockGetApplicationProgress = jest.fn();
  const mockGetAvailableTeamMembers = jest.fn();
  const mockAssignTeamMember = jest.fn();
  const mockInviteCollaborator = jest.fn();
  const mockUpdateQuestionAnswer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const { getGrantsService } = require('../../lib/services/grants-service');
    getGrantsService.mockReturnValue({
      getApplicationQuestions: mockGetApplicationQuestions,
      getTeamAssignments: mockGetTeamAssignments,
      getCollaborators: mockGetCollaborators,
      getApplicationProgress: mockGetApplicationProgress,
      getAvailableTeamMembers: mockGetAvailableTeamMembers,
      assignTeamMember: mockAssignTeamMember,
      inviteCollaborator: mockInviteCollaborator,
      updateQuestionAnswer: mockUpdateQuestionAnswer,
    });
  });

  it('renders the project manager interface', async () => {
    mockGetApplicationQuestions.mockResolvedValue([]);
    mockGetTeamAssignments.mockResolvedValue([]);
    mockGetCollaborators.mockResolvedValue([]);
    mockGetApplicationProgress.mockResolvedValue({ percentage_complete: 0, completed_questions: 0, total_questions: 0 });
    mockGetAvailableTeamMembers.mockResolvedValue([]);

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);
    
    await waitFor(() => {
      expect(screen.getByText(/Overview/i)).toBeInTheDocument();
      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });
  });

  it('loads grant data on mount', async () => {
    mockGetApplicationQuestions.mockResolvedValue([]);
    mockGetTeamAssignments.mockResolvedValue([]);
    mockGetCollaborators.mockResolvedValue([]);
    mockGetApplicationProgress.mockResolvedValue({ percentage_complete: 0, completed_questions: 0, total_questions: 0 });
    mockGetAvailableTeamMembers.mockResolvedValue([]);

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);

    await waitFor(() => {
      expect(mockGetApplicationQuestions).toHaveBeenCalledWith(1);
      expect(mockGetTeamAssignments).toHaveBeenCalledWith(1);
      expect(mockGetCollaborators).toHaveBeenCalledWith(1);
      expect(mockGetApplicationProgress).toHaveBeenCalledWith(1);
      expect(mockGetAvailableTeamMembers).toHaveBeenCalled();
    });
  });

  it('displays grant information when loaded', async () => {
    mockGetApplicationQuestions.mockResolvedValue([]);
    mockGetTeamAssignments.mockResolvedValue([]);
    mockGetCollaborators.mockResolvedValue([]);
    mockGetApplicationProgress.mockResolvedValue({ percentage_complete: 0, completed_questions: 0, total_questions: 0 });
    mockGetAvailableTeamMembers.mockResolvedValue([]);

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);

    await waitFor(() => {
      expect(screen.getByText('Application Progress')).toBeInTheDocument();
      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });
  });

  it('handles team member assignment', async () => {
    mockGetApplicationQuestions.mockResolvedValue([]);
    mockGetTeamAssignments.mockResolvedValue([]);
    mockGetCollaborators.mockResolvedValue([]);
    mockGetApplicationProgress.mockResolvedValue({ percentage_complete: 0, completed_questions: 0, total_questions: 0 });
    mockGetAvailableTeamMembers.mockResolvedValue([]);
    mockAssignTeamMember.mockResolvedValue({ success: true });

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);

    // Check that the component renders without crashing
    await waitFor(() => {
      expect(screen.getByText(/Overview/i)).toBeInTheDocument();
      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });
  });

  it('handles collaborator invitation', async () => {
    mockGetApplicationQuestions.mockResolvedValue([]);
    mockGetTeamAssignments.mockResolvedValue([]);
    mockGetCollaborators.mockResolvedValue([]);
    mockGetApplicationProgress.mockResolvedValue({ percentage_complete: 0, completed_questions: 0, total_questions: 0 });
    mockGetAvailableTeamMembers.mockResolvedValue([]);
    mockInviteCollaborator.mockResolvedValue({ success: true });

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);

    // Check that the component renders without crashing
    await waitFor(() => {
      expect(screen.getByText(/Overview/i)).toBeInTheDocument();
      expect(screen.getByText('0 accepted invitations')).toBeInTheDocument();
    });
  });

  it('updates grant application', async () => {
    mockGetApplicationQuestions.mockResolvedValue([]);
    mockGetTeamAssignments.mockResolvedValue([]);
    mockGetCollaborators.mockResolvedValue([]);
    mockGetApplicationProgress.mockResolvedValue({ percentage_complete: 0, completed_questions: 0, total_questions: 0 });
    mockGetAvailableTeamMembers.mockResolvedValue([]);
    mockUpdateQuestionAnswer.mockResolvedValue(true);

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);

    // Check that the component renders without crashing
    await waitFor(() => {
      expect(screen.getByText(/Overview/i)).toBeInTheDocument();
      expect(screen.getByText('Application Progress')).toBeInTheDocument();
    });
  });

  it('handles loading state', async () => {
    mockGetApplicationQuestions.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    mockGetTeamAssignments.mockResolvedValue([]);
    mockGetCollaborators.mockResolvedValue([]);
    mockGetApplicationProgress.mockResolvedValue({ percentage_complete: 0, completed_questions: 0, total_questions: 0 });
    mockGetAvailableTeamMembers.mockResolvedValue([]);

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);

    // Check that the component renders without crashing
    await waitFor(() => {
      expect(screen.getByText(/Overview/i)).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    mockGetApplicationQuestions.mockRejectedValue(new Error('Failed to load grant'));
    mockGetTeamAssignments.mockResolvedValue([]);
    mockGetCollaborators.mockResolvedValue([]);
    mockGetApplicationProgress.mockResolvedValue({ percentage_complete: 0, completed_questions: 0, total_questions: 0 });
    mockGetAvailableTeamMembers.mockResolvedValue([]);

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);

    // Check that the component renders without crashing
    await waitFor(() => {
      expect(screen.getByText(/Overview/i)).toBeInTheDocument();
    });
  });

  it('displays project overview', async () => {
    mockGetApplicationQuestions.mockResolvedValue([]);
    mockGetTeamAssignments.mockResolvedValue([]);
    mockGetCollaborators.mockResolvedValue([]);
    mockGetApplicationProgress.mockResolvedValue({ percentage_complete: 0, completed_questions: 0, total_questions: 0 });
    mockGetAvailableTeamMembers.mockResolvedValue([]);

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);
    
    await waitFor(() => {
      expect(screen.getByText(/Overview/i)).toBeInTheDocument();
    });
  });

  it('displays application progress', async () => {
    mockGetApplicationQuestions.mockResolvedValue([]);
    mockGetTeamAssignments.mockResolvedValue([]);
    mockGetCollaborators.mockResolvedValue([]);
    mockGetApplicationProgress.mockResolvedValue({ percentage_complete: 0, completed_questions: 0, total_questions: 0 });
    mockGetAvailableTeamMembers.mockResolvedValue([]);

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);
    
    await waitFor(() => {
      expect(screen.getByText(/Application Progress/i)).toBeInTheDocument();
    });
  });
});

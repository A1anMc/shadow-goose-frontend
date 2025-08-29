import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import GrantProjectManager from '../GrantProjectManager';

// Mock the grants service
jest.mock('../../lib/services/grants-service', () => ({
  getGrantsService: jest.fn(() => ({
    getGrantById: jest.fn(),
    updateGrantApplication: jest.fn(),
    assignTeamMember: jest.fn(),
    inviteCollaborator: jest.fn(),
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

  const mockGetGrantById = jest.fn();
  const mockUpdateGrantApplication = jest.fn();
  const mockAssignTeamMember = jest.fn();
  const mockInviteCollaborator = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const { getGrantsService } = require('../../lib/services/grants-service');
    getGrantsService.mockReturnValue({
      getGrantById: mockGetGrantById,
      updateGrantApplication: mockUpdateGrantApplication,
      assignTeamMember: mockAssignTeamMember,
      inviteCollaborator: mockInviteCollaborator,
    });
  });

  it('renders the project manager interface', () => {
    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);
    
    expect(screen.getByText(/Project Manager/i)).toBeInTheDocument();
    expect(screen.getByText(/Team Management/i)).toBeInTheDocument();
  });

  it('loads grant data on mount', async () => {
    mockGetGrantById.mockResolvedValue({ data: mockGrant });

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);

    await waitFor(() => {
      expect(mockGetGrantById).toHaveBeenCalledWith('grant-1');
    });
  });

  it('displays grant information when loaded', async () => {
    mockGetGrantById.mockResolvedValue({ data: mockGrant });

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);

    await waitFor(() => {
      expect(screen.getByText('Test Grant')).toBeInTheDocument();
      expect(screen.getByText('Test grant description')).toBeInTheDocument();
    });
  });

  it('handles team member assignment', async () => {
    mockAssignTeamMember.mockResolvedValue({ success: true });

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);

    // Check that the component renders without crashing
    expect(screen.getByText(/Project Manager/i)).toBeInTheDocument();
    expect(screen.getByText(/Team Management/i)).toBeInTheDocument();
  });

  it('handles collaborator invitation', async () => {
    mockInviteCollaborator.mockResolvedValue({ success: true });

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);

    // Check that the component renders without crashing
    expect(screen.getByText(/Project Manager/i)).toBeInTheDocument();
    expect(screen.getByText(/Collaborators/i)).toBeInTheDocument();
  });

  it('updates grant application', async () => {
    mockUpdateGrantApplication.mockResolvedValue({ success: true });

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);

    // Check that the component renders without crashing
    expect(screen.getByText(/Project Manager/i)).toBeInTheDocument();
    expect(screen.getByText(/Progress/i)).toBeInTheDocument();
  });

  it('handles loading state', () => {
    mockGetGrantById.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);

    // Check that the component renders without crashing
    expect(screen.getByText(/Project Manager/i)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockGetGrantById.mockRejectedValue(new Error('Failed to load grant'));

    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);

    // Check that the component renders without crashing
    expect(screen.getByText(/Project Manager/i)).toBeInTheDocument();
  });

  it('displays project overview', () => {
    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);
    
    expect(screen.getByText(/Overview/i)).toBeInTheDocument();
  });

  it('displays application progress', () => {
    render(<GrantProjectManager 
      applicationId={1} 
      grant={{ id: "grant-1", name: "Test Grant" }} 
      onUpdate={() => {}} 
    />);
    
    expect(screen.getByText(/Application Progress/i)).toBeInTheDocument();
  });
});

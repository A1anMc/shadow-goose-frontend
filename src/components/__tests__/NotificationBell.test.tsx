import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import NotificationBell from '../NotificationBell';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock the notification service
jest.mock('../../lib/notifications', () => ({
  notificationService: {
    getNotifications: jest.fn(),
    markAsRead: jest.fn(),
    deleteNotification: jest.fn(),
  },
  Notification: jest.fn(),
}));

describe('NotificationBell', () => {
  const mockNotifications = [
    {
      id: '1',
      title: 'Grant Approved',
      message: 'Your grant application has been approved',
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: '2',
      title: 'Deadline Reminder',
      message: 'Grant deadline approaching',
      type: 'warning',
      timestamp: new Date().toISOString(),
      read: true,
    },
  ];

  const mockGetNotifications = jest.fn();
  const mockMarkAsRead = jest.fn();
  const mockDeleteNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const { notificationService } = require('../../lib/notifications');
    notificationService.getNotifications = mockGetNotifications;
    notificationService.markAsRead = mockMarkAsRead;
    notificationService.deleteNotification = mockDeleteNotification;
  });

  it('renders the notification bell', () => {
    render(<NotificationBell />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
  });

  it('displays notification count', async () => {
    mockGetNotifications.mockResolvedValue(mockNotifications);

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('shows notification dropdown when clicked', async () => {
    mockGetNotifications.mockResolvedValue(mockNotifications);

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Grant Approved')).toBeInTheDocument();
      expect(screen.getByText('Deadline Reminder')).toBeInTheDocument();
    });
  });

  it('marks notification as read when clicked', async () => {
    mockGetNotifications.mockResolvedValue(mockNotifications);
    mockMarkAsRead.mockResolvedValue({ success: true });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      const notification = screen.getByText('Grant Approved');
      fireEvent.click(notification);
    });

    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('deletes notification when delete button is clicked', async () => {
    mockGetNotifications.mockResolvedValue(mockNotifications);
    mockDeleteNotification.mockResolvedValue({ success: true });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      const deleteButton = screen.getByTestId('delete-notification-1');
      fireEvent.click(deleteButton);
    });

    expect(mockDeleteNotification).toHaveBeenCalledWith('1');
  });

  it('handles empty notifications', async () => {
    mockGetNotifications.mockResolvedValue([]);

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText(/No notifications/i)).toBeInTheDocument();
    });
  });

  it('handles loading state', () => {
    mockGetNotifications.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<NotificationBell />);

    expect(screen.getByTestId('notification-loading')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockGetNotifications.mockRejectedValue(new Error('Failed to load notifications'));

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading notifications/i)).toBeInTheDocument();
    });
  });

  it('displays notification types correctly', async () => {
    mockGetNotifications.mockResolvedValue(mockNotifications);

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByTestId('notification-success')).toBeInTheDocument();
      expect(screen.getByTestId('notification-warning')).toBeInTheDocument();
    });
  });

  it('updates notification count when notifications change', async () => {
    mockGetNotifications.mockResolvedValue(mockNotifications);

    const { rerender } = render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Simulate notifications being marked as read
    mockGetNotifications.mockResolvedValue([mockNotifications[0]]);

    rerender(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});

// Grant Application Notifications System
// Handles all notifications for grant applications, deadlines, and updates

export interface Notification {
  id: string;
  type: 'deadline' | 'status_update' | 'reminder' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  grant_id?: number;
  application_id?: number;
  created_at: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  action_text?: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  deadline_reminders: boolean;
  status_updates: boolean;
  weekly_summaries: boolean;
  reminder_days: number[]; // Days before deadline to send reminders
}

class NotificationService {
  private notifications: Notification[] = [];
  private preferences: NotificationPreferences = {
    email_notifications: true,
    push_notifications: true,
    deadline_reminders: true,
    status_updates: true,
    weekly_summaries: true,
    reminder_days: [7, 3, 1] // 7 days, 3 days, and 1 day before deadline
  };

  constructor() {
    this.loadNotifications();
    this.loadPreferences();
  }

  // Create a new notification
  createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.showNotification(newNotification);
    
    return newNotification;
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return this.notifications;
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  // Delete notification
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  // Clear all notifications
  clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotifications();
  }

  // Get notification preferences
  getPreferences(): NotificationPreferences {
    return this.preferences;
  }

  // Update notification preferences
  updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();
  }

  // Check for deadline reminders
  checkDeadlineReminders(applications: any[], grants: any[]): void {
    if (!this.preferences.deadline_reminders) return;

    const now = new Date();
    
    applications.forEach(application => {
      const grant = grants.find(g => g.id === application.grant_id);
      if (!grant || application.status === 'submitted' || application.status === 'approved' || application.status === 'rejected') {
        return;
      }

      const deadline = new Date(grant.deadline);
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check if we should send a reminder
      if (this.preferences.reminder_days.includes(daysUntilDeadline)) {
        this.createDeadlineReminder(application, grant, daysUntilDeadline);
      }
    });
  }

  // Create deadline reminder notification
  private createDeadlineReminder(application: any, grant: any, daysLeft: number): void {
    const urgency = daysLeft <= 1 ? 'urgent' : daysLeft <= 3 ? 'high' : 'medium';
    const type = daysLeft <= 1 ? 'warning' : 'reminder';

    this.createNotification({
      type,
      priority: urgency,
      title: `Deadline Reminder: ${grant.name}`,
      message: `Your application for ${grant.name} is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Don't forget to submit!`,
      grant_id: grant.id,
      application_id: application.id,
      action_url: `/grants/applications/${application.id}`,
      action_text: 'Continue Application'
    });
  }

  // Create status update notification
  createStatusUpdateNotification(application: any, grant: any, oldStatus: string, newStatus: string): void {
    const statusMessages = {
      'submitted': 'Your application has been submitted successfully!',
      'approved': '🎉 Congratulations! Your application has been approved!',
      'rejected': 'Your application was not successful this time. Keep trying!',
      'in_progress': 'Your application is being reviewed.',
      'draft': 'Your application has been saved as a draft.'
    };

    const priority = newStatus === 'approved' ? 'high' : newStatus === 'rejected' ? 'medium' : 'low';
    const type = newStatus === 'approved' ? 'success' : newStatus === 'rejected' ? 'warning' : 'info';

    this.createNotification({
      type,
      priority,
      title: `Application Status Update: ${grant.name}`,
      message: statusMessages[newStatus as keyof typeof statusMessages] || `Your application status has changed to ${newStatus}.`,
      grant_id: grant.id,
      application_id: application.id,
      action_url: `/grants/applications/${application.id}`,
      action_text: 'View Application'
    });
  }

  // Create success notification
  createSuccessNotification(title: string, message: string, actionUrl?: string): void {
    this.createNotification({
      type: 'success',
      priority: 'medium',
      title,
      message,
      action_url: actionUrl
    });
  }

  // Create warning notification
  createWarningNotification(title: string, message: string, actionUrl?: string): void {
    this.createNotification({
      type: 'warning',
      priority: 'high',
      title,
      message,
      action_url: actionUrl
    });
  }

  // Create info notification
  createInfoNotification(title: string, message: string, actionUrl?: string): void {
    this.createNotification({
      type: 'info',
      priority: 'low',
      title,
      message,
      action_url: actionUrl
    });
  }

  // Show notification in browser
  private showNotification(notification: Notification): void {
    if (!this.preferences.push_notifications) return;

    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });

      // Handle notification click
      browserNotification.onclick = () => {
        if (notification.action_url) {
          window.open(notification.action_url, '_self');
        }
        browserNotification.close();
      };
    }
  }

  // Request notification permissions
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Save notifications to localStorage
  private saveNotifications(): void {
    try {
      localStorage.setItem('grant_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // Load notifications from localStorage
  private loadNotifications(): void {
    try {
      const saved = localStorage.getItem('grant_notifications');
      if (saved) {
        this.notifications = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  // Save preferences to localStorage
  private savePreferences(): void {
    try {
      localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  // Load preferences from localStorage
  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem('notification_preferences');
      if (saved) {
        this.preferences = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  // Get notification count by type
  getNotificationCountByType(type: Notification['type']): number {
    return this.notifications.filter(n => n.type === type).length;
  }

  // Get unread notification count by type
  getUnreadNotificationCountByType(type: Notification['type']): number {
    return this.notifications.filter(n => n.type === type && !n.read).length;
  }

  // Get notifications by priority
  getNotificationsByPriority(priority: Notification['priority']): Notification[] {
    return this.notifications.filter(n => n.priority === priority);
  }

  // Get urgent notifications
  getUrgentNotifications(): Notification[] {
    return this.notifications.filter(n => n.priority === 'urgent' && !n.read);
  }

  // Check if there are any urgent notifications
  hasUrgentNotifications(): boolean {
    return this.getUrgentNotifications().length > 0;
  }

  // Get notification summary
  getNotificationSummary(): {
    total: number;
    unread: number;
    urgent: number;
    byType: Record<Notification['type'], number>;
  } {
    const byType = {
      deadline: this.getNotificationCountByType('deadline'),
      status_update: this.getNotificationCountByType('status_update'),
      reminder: this.getNotificationCountByType('reminder'),
      success: this.getNotificationCountByType('success'),
      warning: this.getNotificationCountByType('warning'),
      info: this.getNotificationCountByType('info')
    };

    return {
      total: this.notifications.length,
      unread: this.getUnreadNotifications().length,
      urgent: this.getUrgentNotifications().length,
      byType
    };
  }
}

export const notificationService = new NotificationService();

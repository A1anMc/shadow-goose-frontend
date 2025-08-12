import { Notification as WSNotification } from './websocket';

class NotificationService {
  private notifications: WSNotification[] = [];
  private listeners: ((notifications: WSNotification[]) => void)[] = [];

  // Get all notifications
  getNotifications(): WSNotification[] {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnreadNotifications(): WSNotification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Add a new notification
  addNotification(notification: Omit<WSNotification, 'id' | 'timestamp'>) {
    const newNotification: WSNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.notifications.unshift(newNotification);

    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.notifyListeners();

    // Show browser notification if supported
    this.showBrowserNotification(newNotification);
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  // Delete notification
  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifyListeners();
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Subscribe to notification changes
  subscribe(listener: (notifications: WSNotification[]) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  private showBrowserNotification(notification: WSNotification) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission()await permission => {
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              tag: notification.id,
            });
          }
        });
      }
    }
  }

  // Request notification permission
  requestPermission(): Promise<NotificationPermission> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.requestPermission();
    }
    return Promise.resolve('denied');
  }

  // Get notification count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}

export const notificationService = new NotificationService();

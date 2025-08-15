import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Notification, notificationService } from '../lib/notifications';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasUrgent, setHasUrgent] = useState(false);

  useEffect(() => {
    const updateNotifications = () => {
      const allNotifications = notificationService.getNotifications();
      const unreadNotifications = notificationService.getUnreadNotifications();
      setNotifications(unreadNotifications);
      setHasUrgent(notificationService.hasUrgentNotifications());
    };

    // Initial update
    updateNotifications();

    // Update every 30 seconds
    const interval = setInterval(updateNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    notificationService.markAsRead(notification.id);
    
    if (notification.action_url) {
      router.push(notification.action_url);
    }
    
    setShowDropdown(false);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
    setNotifications([]);
    setHasUrgent(false);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'deadline': return '⏰';
      case 'status_update': return '📊';
      case 'reminder': return '🔔';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'deadline': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'status_update': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-sg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-sg-primary focus:ring-offset-2 rounded-md"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v4.5l2.25 2.25a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V9.75a6 6 0 0 1 6-6z" />
        </svg>
        
        {/* Notification Badge */}
        {notifications.length > 0 && (
          <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
            hasUrgent ? 'bg-red-500 text-white' : 'bg-sg-primary text-white'
          }`}>
            {notifications.length > 99 ? '99+' : notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  Notifications
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No new notifications
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer ${
                      notification.priority === 'urgent' ? 'bg-red-50' : 
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <span className={`text-xs ${getNotificationColor(notification.type)}`}>
                            {notification.priority === 'urgent' ? 'URGENT' : 
                             notification.priority === 'high' ? 'HIGH' : 
                             notification.priority === 'medium' ? 'MED' : 'LOW'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                        {notification.action_text && (
                          <p className="text-xs text-sg-primary mt-1 font-medium">
                            {notification.action_text} →
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 10 && (
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={() => router.push('/grants/applications/dashboard')}
                  className="w-full text-center text-sm text-sg-primary hover:text-sg-primary/80"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

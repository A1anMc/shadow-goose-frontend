import { useState, useEffect } from 'react';
import { websocketService } from '../lib/websocket';
import { notificationService } from '../lib/notifications';
import { ProjectUpdateData, OKRUpdateData, NotificationData } from '../types/websocket';

interface RealTimeStatusProps {
  onDataRefresh?: () => void;
  refreshInterval?: number; // in seconds
}

export default function RealTimeStatus({ onDataRefresh, refreshInterval = 30 }: RealTimeStatusProps) {
  const [connectionStatus, setConnectionStatus] = useState(websocketService.getConnectionStatus());
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [nextRefresh, setNextRefresh] = useState(new Date(Date.now() + refreshInterval * 1000));
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Set up connection status monitoring
    const connectionInterval = setInterval(() => {
      setConnectionStatus(websocketService.getConnectionStatus());
    }, 1000);

    // Set up auto-refresh timer
    const refreshTimer = setInterval(() => {
      setLastRefresh(new Date());
      setNextRefresh(new Date(Date.now() + refreshInterval * 1000));
      onDataRefresh?.();
    }, refreshInterval * 1000);

    // Set up WebSocket message handlers
    const handleProjectUpdate = (data: ProjectUpdateData) => {
      notificationService.addNotification({
        type: 'info',
        title: 'Project Update',
        message: `Project ${data.projectId} status updated to ${data.status}`,
        read: false,
      });
      onDataRefresh?.();
    };

    const handleOKRUpdate = (data: OKRUpdateData) => {
      notificationService.addNotification({
        type: 'info',
        title: 'OKR Update',
        message: `OKR ${data.okrId} progress updated to ${data.progress}%`,
        read: false,
      });
      onDataRefresh?.();
    };

    const handleNotification = (data: NotificationData) => {
      notificationService.addNotification(data);
    };

    websocketService.on('project_update', handleProjectUpdate);
    websocketService.on('okr_update', handleOKRUpdate);
    websocketService.on('notification', handleNotification);

    // Subscribe to notification changes
    const unsubscribe = notificationService.subscribe((notifications) => {
      setNotifications(notifications);
      setNotificationCount(notificationService.getUnreadCount());
    });

    // Request notification permission
    notificationService.requestPermission();

    return () => {
      clearInterval(connectionInterval);
      clearInterval(refreshTimer);
      websocketService.off('project_update', handleProjectUpdate);
      websocketService.off('okr_update', handleOKRUpdate);
      websocketService.off('notification', handleNotification);
      unsubscribe();
    };
  }, [onDataRefresh, refreshInterval]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getConnectionColor = () => {
    return connectionStatus.connected ? 'text-green-600' : 'text-red-600';
  };

  const getConnectionIcon = () => {
    return connectionStatus.connected ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  };

  return (
    <div className="relative">
      {/* Real-time status bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 ${getConnectionColor()}`}>
                {getConnectionIcon()}
                <span className="text-sm font-medium">
                  {connectionStatus.connected ? 'Live' : 'Offline'}
                </span>
              </div>
              {!connectionStatus.connected && connectionStatus.reconnectAttempts > 0 && (
                <span className="text-xs text-gray-500">
                  (Reconnecting... {connectionStatus.reconnectAttempts})
                </span>
              )}
            </div>

            {/* Auto-refresh Status */}
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm text-gray-600">
                Auto-refresh every {refreshInterval}s
              </span>
            </div>

            {/* Last Refresh */}
            <div className="text-sm text-gray-500">
              Last: {formatTime(lastRefresh)}
            </div>

            {/* Next Refresh */}
            <div className="text-sm text-gray-500">
              Next: {formatTime(nextRefresh)}
            </div>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75a6 6 0 006 6h3a6 6 0 006-6V9.75a6 6 0 00-6-6h-3z" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    <button
                      onClick={() => notificationService.markAllAsRead()}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-block w-2 h-2 rounded-full ${
                                notification.type === 'error' ? 'bg-red-500' :
                                notification.type === 'warning' ? 'bg-yellow-500' :
                                notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                              }`}></span>
                              <h4 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.timestamp ? new Date(notification.timestamp).toLocaleString() : 'Just now'}
                            </p>
                          </div>
                          <button
                            onClick={() => notificationService.deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}

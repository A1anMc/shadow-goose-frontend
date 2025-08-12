export interface WebSocketMessage {
  type: 'project_update' | 'okr_update' | 'grant_update' | 'notification' | 'ping';
  data: any;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private isConnected = false;
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  constructor() {
    // Auto-reconnect on page visibility change
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !this.isConnected) {
          this.connect();
        }
      });
    }
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const token = localStorage.getItem('sge_auth_token');
      if (!token) {
        console.log('No auth token, skipping WebSocket connection');
        return;
      }

      // Use WebSocket URL from environment or fallback to HTTP upgrade
      const wsUrl = this.baseUrl?.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws';
      this.ws = new WebSocket(`${wsUrl}?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.stopHeartbeat();

        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', data: {} });
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message.data));
    }
  }

  send(message: Omit<WebSocketMessage, 'timestamp'>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  on(messageType: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  off(messageType: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      readyState: this.ws?.readyState,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Mock WebSocket Service for development
class MockWebSocketService {
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private mockInterval: NodeJS.Timeout | null = null;
  private isConnected = false;

  connect() {
    console.log('Mock WebSocket connected');
    this.isConnected = true;
    this.startMockUpdates();
  }

  private startMockUpdates() {
    // Simulate real-time updates every 30 seconds
    this.mockInterval = setInterval(() => {
      this.simulateRandomUpdate();
    }, 30000);
  }

  private simulateRandomUpdate() {
    const updates = [
      {
        type: 'project_update',
        data: {
          projectId: Math.floor(Math.random() * 3) + 1,
          status: ['on-track', 'at-risk', 'behind'][Math.floor(Math.random() * 3)],
          progress: Math.floor(Math.random() * 100),
        },
      },
      {
        type: 'okr_update',
        data: {
          okrId: Math.floor(Math.random() * 3) + 1,
          keyResultId: Math.floor(Math.random() * 9) + 1,
          current: Math.floor(Math.random() * 500),
          progress: Math.floor(Math.random() * 100),
        },
      },
      {
        type: 'notification',
        data: {
          id: `notification-${Date.now()}`,
          type: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)],
          title: 'System Update',
          message: 'Data has been refreshed automatically',
          timestamp: new Date().toISOString(),
          read: false,
        },
      },
    ];

    const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
    this.handleMessage(randomUpdate);
  }

  private handleMessage(message: any) {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message.data));
    }
  }

  send(message: any) {
    console.log('Mock WebSocket send:', message);
  }

  on(messageType: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  off(messageType: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  disconnect() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
    this.isConnected = false;
    console.log('Mock WebSocket disconnected');
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      readyState: this.isConnected ? 1 : 3,
      reconnectAttempts: 0,
    };
  }
}

// Export the appropriate service based on environment
export const websocketService = process.env.NODE_ENV === 'production'
  ? new WebSocketService()
  : new MockWebSocketService();

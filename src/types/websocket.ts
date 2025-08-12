export interface ProjectUpdateData {
  projectId: number;
  status: string;
  progress?: number;
  updatedAt: string;
}

export interface OKRUpdateData {
  okrId: number;
  progress: number;
  status: string;
  updatedAt: string;
}

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  timestamp?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  lastConnected?: string;
  reconnectAttempts: number;
}

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { io, Socket } from 'socket.io-client';

const getSocketServerUrl = (): string => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  return 'http://localhost:5000';
};

const SOCKET_SERVER_URL = getSocketServerUrl();

class MobileSocketService {
  private socket: Socket | null = null;

  public connect(userId?: string, role?: string): Socket {
    if (this.socket && this.socket.connected) {
      if (role === 'admin') {
        this.socket.emit('join_admin_room');
      }
      return this.socket;
    }

    this.socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    this.socket.on('connect', () => {
      console.log('[Socket Mobile] Connected to server:', this.socket?.id);
      if (userId) {
        this.socket?.emit('join_user_room', userId);
      }
      if (role === 'admin') {
        this.socket?.emit('join_admin_room');
      }
    });

    return this.socket;
  }

  public joinOrderRoom(orderId: string): void {
    if (this.socket) {
      this.socket.emit('join_order_room', orderId);
    }
  }

  public joinAdminRoom(): void {
    if (this.socket) {
      this.socket.emit('join_admin_room');
    }
  }

  public onOrderStatusUpdated(callback: (data: any) => void): () => void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('order_status_updated', callback);
    return () => {
      this.socket?.off('order_status_updated', callback);
    };
  }

  public onNewOrderReceived(callback: (data: any) => void): () => void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('new_order_received', callback);
    return () => {
      this.socket?.off('new_order_received', callback);
    };
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const mobileSocket = new MobileSocketService();

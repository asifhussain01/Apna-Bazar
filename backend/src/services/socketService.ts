import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

class SocketService {
  private io: SocketIOServer | null = null;

  public init(httpServer: HttpServer, corsOrigin: string | string[]): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`[Socket.io] Client connected: ${socket.id}`);

      // Customer joins room to track specific order
      socket.on('join_order_room', (orderId: string) => {
        if (orderId) {
          socket.join(`order:${orderId}`);
          console.log(`[Socket.io] ${socket.id} joined order:${orderId}`);
        }
      });

      // Customer joins private user notifications room
      socket.on('join_user_room', (userId: string) => {
        if (userId) {
          socket.join(`user:${userId}`);
          console.log(`[Socket.io] ${socket.id} joined user:${userId}`);
        }
      });

      // Admin joins admin notification channel
      socket.on('join_admin_room', () => {
        socket.join('admin_channel');
        console.log(`[Socket.io] Admin ${socket.id} joined admin_channel`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.io] Client disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io has not been initialized yet');
    }
    return this.io;
  }

  // Notify admin room and storekeeper of a newly placed order
  public notifyNewOrder(orderData: any): void {
    if (this.io) {
      this.io.to('admin_channel').emit('new_order_received', orderData);
      this.io.emit('new_order_received', orderData);
    }
  }

  // Notify customer and admin of order status progression
  public notifyOrderStatusChanged(orderId: string, userId: string | undefined, payload: any): void {
    if (this.io) {
      // Room for this specific order
      this.io.to(`order:${orderId}`).emit('order_status_updated', payload);

      // Room for user if customer exists
      if (userId) {
        this.io.to(`user:${userId}`).emit('order_status_updated', payload);
      }

      // Also notify admin
      this.io.to('admin_channel').emit('admin_order_status_updated', payload);
    }
  }

  // Notify admin when product stock reaches or falls below threshold
  public notifyLowStock(productData: any): void {
    if (this.io) {
      this.io.to('admin_channel').emit('low_stock_warning', productData);
    }
  }
}

export const socketService = new SocketService();

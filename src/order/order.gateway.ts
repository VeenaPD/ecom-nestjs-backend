import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayConnection, 
    OnGatewayDisconnect, 
    OnGatewayInit
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OrderLiveUpdateDTO } from './dto/order-liveupdate.dto';

// Define the namespace for order-related events
@WebSocketGateway({
    namespace: '/orders', // Clients will connect to ws://localhost:3000/orders
    cors: {
        origin: '*',
    },
})
export class OrderGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(OrderGateway.name);

    afterInit(server: Server) {
        this.logger.log('Order Gateway Initialized');
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Order client connected: ${client.id}`);
        // A client (user) might join a specific room here, e.g., 'user-123' or 'order-ABC'
        // For simplicity, let's assume a 'joinOrderUpdates' event.
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Order client disconnected: ${client.id}`);
    }

    // Client joins a room, e.g., 'user_123' or 'order_ABC'
    @SubscribeMessage('joinOrderUpdates')
    handleJoinOrderUpdates(@MessageBody() payload: OrderLiveUpdateDTO, @ConnectedSocket() client: Socket): void {
        if (payload.userId) {
            client.join(`user_${payload.userId}`);
            this.logger.log(`Client ${client.id} joined room: user_${payload.userId}`);
            client.emit('joinedRoom', `You have joined updates for user ${payload.userId}`);
        } else if (payload.orderId) {
            client.join(`order_${payload.orderId}`);
            this.logger.log(`Client ${client.id} joined room: order_${payload.orderId}`);
            client.emit('joinedRoom', `You have joined updates for order ${payload.orderId}`);
        } else {
            client.emit('error', 'Please provide userId or orderId to join updates.');
        }
    }

    // Method to emit order status updates (called from OrderService)
    // This method needs to be public so it can be injected and called
    public sendOrderStatusUpdate(orderId: string, status: string, userId: string): void {
        const payload = { orderId, status, timestamp: new Date().toISOString() };
        this.logger.log(`Emitting order status update: ${JSON.stringify(payload)}`);

        // Emit to the specific user's room
        this.server.to(`user_${userId}`).emit('orderStatusUpdated', payload);
        this.logger.log(`Sent update to user_${userId} room`);

        // Optionally, emit to a specific order's room (if admin wants to track specific orders)
        this.server.to(`order_${orderId}`).emit('orderStatusUpdated', payload);
        this.logger.log(`Sent update to order_${orderId} room`);

        // Optional: If admins are in a global 'adminUpdates' room, you can send there too
        // this.server.to('adminUpdates').emit('orderStatusUpdated', payload);
    }
}
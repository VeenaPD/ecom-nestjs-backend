// src/events/events.gateway.ts
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
import { Server, Socket } from 'socket.io'; // Import Server and Socket from 'socket.io'

@WebSocketGateway({
    cors: {
        origin: '*', // Allow all origins for testing, restrict in production
    },
    // namespace: '/events', // Optional: if you want a specific namespace
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server; // Injects the Socket.IO server instance

    private connectedClients: number = 0; // Simple counter for demonstration

    afterInit(server: Server) {
        console.log('WebSocket Gateway Initialized');
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.connectedClients++;
        console.log(`Client connected: ${client.id}. Total clients: ${this.connectedClients}`);
        // Emit a welcome message to the connecting client
        client.emit('welcome', `Hello ${client.id}, welcome to the server!`);
        // Broadcast to all (except sender) that a new client connected
        client.broadcast.emit('userConnected', `A new user with ID ${client.id} has connected!`);
    }

    handleDisconnect(client: Socket) {
        this.connectedClients--;
        console.log(`Client disconnected: ${client.id}. Total clients: ${this.connectedClients}`);
        // Broadcast to all (except sender) that a client disconnected
        client.broadcast.emit('userDisconnected', `User ${client.id} has disconnected.`);
    }

    @SubscribeMessage('message') // Listens for 'message' event from client
    handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): any {
        console.log(`Received message from ${client.id}: ${data}`);
        // Example: Echo the message back to the sender
        client.emit('message', `Server received: ${data}`); // Send back to sender
        // Or, broadcast to all others:
        client.broadcast.emit('message', `User ${client.id} sent: ${data}`); // Send to all except sender

        // You can also return a value, which NestJS will emit back as 'message' event
        // return `Server received your message: ${data}`; // This will emit to sender on 'message' event
    }

    @SubscribeMessage('ping')
    handlePing(@ConnectedSocket() client: Socket): void {
        console.log(`Ping from ${client.id}`);
        client.emit('pong', 'pong!'); // Respond with 'pong' event
    }
}
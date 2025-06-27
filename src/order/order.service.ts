// src/order/order.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderGateway } from './order.gateway'; // Import the Gateway
import { Order, User } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  // Inject the OrderGateway here to send real-time updates
  constructor(private readonly orderGateway: OrderGateway,
    private prisma: PrismaService) { }

  async createOrder(
    createOrderDto: CreateOrderDto,
    userId: string, // <-- Added authorId
  ): Promise<Order> {
    console.log(userId, "authorId product service");

    return this.prisma.order.create({
      data: {
        ...createOrderDto,
        userId, // <-- Assign the authorId
      },
    });
  }


  async findAll(): Promise<Order[]> {
    return this.prisma.order.findMany();
  }

  async findOrderById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  // This method simulates an admin updating an order status
  async updateOrderStatus(id: string, newStatus: string): Promise<Order> {
    try {
      const order = await this.prisma.order.update({
        where: { id },
        data: {
          ...UpdateOrderDto,
          status: newStatus
        },
      });
      this.logger.log(`Order ${id} status updated to ${newStatus}`);

      // Crucial: Call the gateway to send the real-time update
      this.orderGateway.sendOrderStatusUpdate(order.id, order.status, order.userId);

      return order;

    } catch (error) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }
}
import { Body, Controller, Get, Request, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, UseGuards, Version } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiHeader, ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { Order, User } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('Orders')
@Controller('orders') // Path is just /orders
export class OrderController {

  constructor(private readonly orderService: OrderService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new order', description: 'Adds a new order to the system.' })
  @ApiResponse({ status: 201, description: 'Order successfully created.', type: CreateOrderDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Requires Admin role.' })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiBody({ type: CreateOrderDto, description: 'Data for creating a order' })
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req: { user: User }): Promise<Order> {
    // Pass the authorId from the authenticated user
    return this.orderService.createOrder(createOrderDto, req.user.id);
  }


  // Get all orders
  @Get()
  @ApiOperation({ summary: 'Get all orders', description: 'Retrieves a list of all order categories.' })
  @ApiResponse({ status: 200, description: 'List of categories.', type: [CreateOrderDto] })
  async findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Order by ID', description: 'Retrieves a single Order by its unique ID.' })
  @ApiParam({ name: 'id', description: 'UUID of the Order to retrieve', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'The order found.', type: CreateOrderDto })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  async findOne(@Param('id') id: string): Promise<Order | null> {
    const order = this.orderService.findOrderById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }


  // Admin endpoint to update order status
  @Patch(':id/status')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update order (Admin or Owner)', description: 'Updates an existing order by ID. Requires Admin role.' })
  @ApiParam({ name: 'id', description: 'UUID of the order to update', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateOrderDto, description: 'Data for updating a order' })
  @ApiResponse({ status: 200, description: 'Order successfully updated.', type: UpdateOrderDto })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden: You do not have permission to update this order.' })
  @UseGuards(AuthGuard('jwt'))
  async updateStatus(@Param('id') id: string, @Body('status') status: string): Promise<Order> {
    if (!status) {
      throw new NotFoundException('Status cannot be empty');
    }
    const updatedOrder = this.orderService.updateOrderStatus(id, status);
    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found for update`);
    }
    return updatedOrder;
  }


    // type: VersioningType.URI, prefix: 'v', // Requests will look like /v1/users, /v2/products
  // This method will respond to GET /v1/orders
  // type: VersioningType.HEADER, header: 'X-API-Version', // Clients send header like X-API-Version: 1
  // Responds to GET /orders with X-API-Version: 1
  // type: VersioningType.QUERY, key: 'version', // Clients send /api/users?version=1
  // Responds to GET /orders?version=1
  // @Version('1')
  // @Get()
  // @ApiOperation({ summary: 'Get all Orders (Version 1)' }) // Description for this endpoint
  // @ApiHeader({
  //   name: 'X-API-Version',
  //   description: 'API Version (set to 1 for this endpoint)',
  //   required: false, 
  //   example: '1',    
  // })
  // getOrdersV1(): string {
  //   return 'Orders API version 1 (Query Param)';
  // }

  // Responds to GET /orders?version=2
  // @Version('2')
  // @Get()
  // @ApiOperation({ summary: 'Get all Orders (Version 2)' }) // Description for this endpoint
  // @ApiHeader({
  //   name: 'X-API-Version',
  //   description: 'API Version (set to 2 for this endpoint)',
  //   required: false,
  //   example: '2',    
  // })
  // getOrdersV2(): string {
  //   return 'Orders API version 2 (Query Param) - Updated!';
  // }
}
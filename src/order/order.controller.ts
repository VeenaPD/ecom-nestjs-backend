import { Controller, Get, Header, Version } from '@nestjs/common';
import { ApiHeader, ApiOperation } from '@nestjs/swagger';

@Controller('orders') // Path is just /orders
export class OrderController {

  // type: VersioningType.URI, prefix: 'v', // Requests will look like /v1/users, /v2/products
  // This method will respond to GET /v1/orders
  // type: VersioningType.HEADER, header: 'X-API-Version', // Clients send header like X-API-Version: 1
  // Responds to GET /orders with X-API-Version: 1
  // type: VersioningType.QUERY, key: 'version', // Clients send /api/users?version=1
  // Responds to GET /orders?version=1
  @Version('1')
  @Get()
  @ApiOperation({ summary: 'Get all Orders (Version 1)' }) // Description for this endpoint
  @ApiHeader({
    name: 'X-API-Version',
    description: 'API Version (set to 1 for this endpoint)',
    required: false, 
    example: '1',    
  })
  getOrdersV1(): string {
    return 'Orders API version 1 (Query Param)';
  }

  // Responds to GET /orders?version=2
  @Version('2')
  @Get()
  @ApiOperation({ summary: 'Get all Orders (Version 2)' }) // Description for this endpoint
  @ApiHeader({
    name: 'X-API-Version',
    description: 'API Version (set to 2 for this endpoint)',
    required: false,
    example: '2',    
  })
  getOrdersV2(): string {
    return 'Orders API version 2 (Query Param) - Updated!';
  }
}
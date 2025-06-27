import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderGateway } from './order.gateway';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule.forRootAsync(),
  ],
  providers: [OrderService,  OrderGateway],
  controllers: [OrderController]
})
export class OrderModule {}

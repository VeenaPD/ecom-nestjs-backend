// Importing the @Module decorator from NestJS core package
import { Module } from '@nestjs/common';

// Importing the service that contains the business logic
import { ProductsService } from './products.service';

// Importing the controller that handles HTTP requests
import { ProductsController } from './products.controller';

@Module({
  // List of services (providers) this module will use and register in the DI container
  providers: [ProductsService],

  // List of controllers this module owns; NestJS will map routes based on this
  controllers: [ProductsController],

  // Optional: Export the ProductsService so it can be used in other modules if needed
  exports: [ProductsService],
})
export class ProductsModule { }

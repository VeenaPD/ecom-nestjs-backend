// Importing the @Module decorator from NestJS core package
import { Module } from '@nestjs/common';

// Importing the service that contains the business logic
import { ProductService } from './product.service';

// Importing the controller that handles HTTP requests
import { ProductController } from './product.controller';
import { AppConfigModule } from 'src/config/config.module';

@Module({
  imports: [AppConfigModule.forRootAsync()],
  // List of services (providers) this module will use and register in the DI container
  providers: [ProductService],

  // List of controllers this module owns; NestJS will map routes based on this
  controllers: [ProductController],

  // Optional: Export the ProductsService so it can be used in other modules if needed
  exports: [ProductService],
})
export class ProductModule { }

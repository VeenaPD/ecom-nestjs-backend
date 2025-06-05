// Import decorators and types from NestJS core package
import { DynamicModule, Global, Module } from '@nestjs/common';

// Import the LoggerService which provides logging functionality
import { LoggerService } from './logger.service';

// Marks this module as a Global Module — services exported here will be available throughout the app
@Global()

// Defines this class as a NestJS module
@Module({}) // Currently no imports, controllers, or providers defined statically
export class LoggerModule {
  
  // Static method to allow dynamic initialization of the module (commonly used for async config)
  static forRootAsync(): DynamicModule {
    return {
      // Registers LoggerModule as the module to be initialized
      module: LoggerModule,

      // Defines dynamic providers that will be instantiated
      providers: [
        {
          // Register LoggerService as a provider (dependency-injectable)
          provide: LoggerService,

          // Custom factory function to asynchronously create an instance of LoggerService
          useFactory: async () => {
            await new Promise((res) => setTimeout(res, 50)); // Simulates async setup delay (e.g., fetching config)
            return new LoggerService('DEBUG'); // Instantiate LoggerService with logging level 'DEBUG'
          },
        },
      ],

      // Exports LoggerService so it can be used in other modules that import LoggerModule
      exports: [LoggerService],
    };
  }
}

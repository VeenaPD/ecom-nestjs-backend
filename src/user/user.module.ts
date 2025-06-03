// Importing NestJS decorators and utilities for defining modules and handling circular dependencies
import { forwardRef, Module } from '@nestjs/common';

// Importing the user-related service that contains business logic
import { UserService } from './user.service';

// Importing the controller that handles HTTP requests related to users
import { UserController } from './user.controller';

// Importing the LoggerModule so this module can use LoggerService
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  // `imports` allows this module to use functionality (like services) from other modules
  // `forwardRef` is needed if LoggerModule also imports UserModule (to resolve circular dependency)
  imports: [forwardRef(() => LoggerModule)],

  // Registers providers (usually services) that are part of this module
  providers: [UserService], // This makes UserService available for DI within this module

  // Registers controllers which handle incoming HTTP requests
  controllers: [UserController], // UserController will be able to handle routes like `/users/:id`

  // Exports allow other modules that import UserModule to access the UserService
  exports: [UserService],
})
export class UserModule { } // This class is the actual module and will be registered in AppModule or other modules

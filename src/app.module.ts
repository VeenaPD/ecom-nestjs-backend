import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { LoggerModule } from './logger/logger.module';
import { DatabaseModule } from './database/database.module';
import { CategoryModule } from './category/category.module';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RolesGuard } from './shared/guards/roles.guard';
import * as Joi from 'joi';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().default('15m'),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().default('7d'),
      }),
    }),
    CacheModule.register({
      isGlobal: true, // Makes CacheModule available globally
      ttl: 60000, // Cache TTL in milliseconds for @nestjs/cache-manager (60 seconds)
      // store: 'memory', // 'memory' is the default if not specified
    }),
    ProductModule,
    UserModule,
    LoggerModule.forRootAsync(),
    DatabaseModule.forRootAsync(), // Initialize our configurable database module
    AppConfigModule.forRootAsync(),
    CategoryModule,
    AuthModule,
    CaslModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: RolesGuard, // Apply RolesGuard globally
  },
  {
    // <--- ADD THIS FOR GLOBAL LOGGING INTERCEPTOR
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  }
  ],
})
export class AppModule { }

// src/config/config.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppConfigService } from './config.service';

@Module({})
export class AppConfigModule {
  // We use forRootAsync because @nestjs/config ConfigModule needs to load .env first
  static forRootAsync(): DynamicModule {
    return {
      module: AppConfigModule,
      imports: [
        NestConfigModule.forRoot({
          isGlobal: true, // Make NestConfigService globally available
          envFilePath: '.env', // Specify .env file path
        }),
      ],
      providers: [AppConfigService], // Provide our wrapper service
      exports: [AppConfigService], // Export our wrapper service
    };
  }
}
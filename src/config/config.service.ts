// src/config/config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

interface AppConfig {
  port: number;
  environment: string;
  databaseUrl: string;
  productApiBaseUrl: string;
}

@Injectable()
export class AppConfigService {
  private readonly config: AppConfig;

  constructor(private readonly nestConfigService: NestConfigService) {
    // You can perform additional validation or transformation here
    this.config = {
      port: this.nestConfigService.get<number>('PORT', 3000),
      environment: this.nestConfigService.get<string>('NODE_ENV', 'development'),
      databaseUrl: this.nestConfigService.get<string>('DATABASE_URL', 'postgresql://postgres:1234567@localhost:5432/ECOM?schema=public'),
      productApiBaseUrl: this.nestConfigService.get<string>('PRODUCT_API_BASE_URL', 'http://localhost:3000/products'),
    };
  }

  get<T extends keyof AppConfig>(key: T): AppConfig[T] {
    return this.config[key];
  }

  // Example of a specific getter for a common config
  isProduction(): boolean {
    return this.config.environment === 'production';
  }
}
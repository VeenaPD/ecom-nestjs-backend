// src/database/database.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { AppConfigModule } from '../config/config.module'; // Assume AppConfigModule is defined
import { AppConfigService } from '../config/config.service';
import { PrismaService } from './prisma.service';

@Module({})
export class DatabaseModule {
  static forRootAsync(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        AppConfigModule.forRootAsync(), // Import our config module to get configService
      ],
      providers: [
        // The factory provider for PrismaService
        {
          provide: PrismaService, // Provide the PrismaService class as the token
          useFactory: async (appConfigService: AppConfigService) => {
            const prismaService = new PrismaService(appConfigService);
            // Since PrismaService implements OnModuleInit, NestJS will call onModuleInit for it
            // during the module initialization phase.
            // We don't need to explicitly call await prismaService.$connect() here.
            return prismaService;
          },
          inject: [AppConfigService], // Inject our AppConfigService into the factory
        },
      ],
      exports: [PrismaService], // Export PrismaService so other modules can inject it
    };
  }
}
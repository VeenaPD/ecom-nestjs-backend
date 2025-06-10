// src/database/prisma.service.ts
import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppConfigService } from '../config/config.service'; // Assuming you have AppConfigService

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(private readonly appConfigService: AppConfigService) {
        // Call super() to initialize PrismaClient with the database URL from config
        super({
            datasources: {
                db: {
                    url: appConfigService.get('databaseUrl'),
                },
            },
            log: ['query', 'info', 'warn', 'error'], // Log Prisma queries for debugging
        });
        console.log(`[PrismaService] Initializing with DB URL: ${appConfigService.get('databaseUrl')}`);
    }

    async onModuleInit() {
        console.log('[PrismaService] Connecting to database...');
        try {
          await this.$connect();
          console.log('[PrismaService] Database connection successful!');
          // REMOVED THE PROBLEMATIC LINE:
          // this.$on('beforeExit', async () => { ... });
          // The onModuleDestroy hook will handle disconnection gracefully.
        } catch (error) {
          console.error('[PrismaService] Database connection failed:', error instanceof Error ? error.message : String(error));
          throw error; // Critical to throw the error to prevent app from starting without DB
        }
      }

    async onModuleDestroy() {
        console.log('[PrismaService] Disconnecting from database...');
        await this.$disconnect();
        console.log('[PrismaService] Database disconnected.');
    }

    // Optional: Add custom methods to expose specific Prisma functionality or extend it
    // async cleanDatabase() {
    //   await this.$transaction([
    //     this.user.deleteMany(),
    //     this.category.deleteMany(),
    //   ]);
    // }
}
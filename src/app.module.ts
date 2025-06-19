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

@Module({
  imports: [ProductModule, 
    UserModule, 
    LoggerModule.forRootAsync(), 
    DatabaseModule.forRootAsync(), // Initialize our configurable database module
    AppConfigModule.forRootAsync(),
    CategoryModule,
    AuthModule,
    CaslModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { UserModule } from './user/user.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [ProductsModule, UserModule, LoggerModule.forRootAsync()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

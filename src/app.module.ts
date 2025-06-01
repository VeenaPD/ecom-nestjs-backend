import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { CategoriesModule } from './categories/category.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ProductModule, CategoriesModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
  exports: []
})
export class AppModule {}

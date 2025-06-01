import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './modules/product/product.module';
import { CategoriesModule } from './modules/categories/category.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrderModule } from './modules/order/order.module';
import { CartModule } from './modules/cart/cart.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ConfigModule } from './core/config/config/config.module';


@Module({
  imports: [ProductModule, CategoriesModule, UserModule, AuthModule, OrderModule, CartModule, PaymentModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
  exports: []
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoriesController } from './category.controller';

@Module({
  imports: [],
  providers: [CategoryService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
